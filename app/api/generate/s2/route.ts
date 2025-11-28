/**
 * API Route: /api/generate/s2
 * Generates S2 Presentation from S1 Survey Data
 * 
 * Uses standard request/response (not streaming) since S2 is typically fast.
 * Includes retry logic for API overload errors.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildS2Prompt, CLAUDE_MODEL, TOKEN_LIMITS } from '@/lib/prompts';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      
      const errorObj = error as { error?: { type?: string } };
      if (errorObj?.error?.type === 'overloaded_error') {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`API overloaded. Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[S2] Starting generation...');

    // Validate API key
    if (!ANTHROPIC_API_KEY) {
      console.error('[S2] API key not configured');
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log('[S2] API key present:', ANTHROPIC_API_KEY.substring(0, 20) + '...');

    // Parse request body
    const body = await request.json();
    const { s1Data } = body;

    if (!s1Data) {
      console.error('[S2] S1 data missing');
      return NextResponse.json(
        { error: 'S1 data is required' },
        { status: 400 }
      );
    }

    console.log('[S2] S1 data received, length:', JSON.stringify(s1Data).length);

    // Build prompt
    const prompt = buildS2Prompt(
      typeof s1Data === 'string' ? s1Data : JSON.stringify(s1Data, null, 2)
    );

    console.log('[S2] Prompt built, length:', prompt.length);

    // Generate S2 with retry logic
    const response = await retryWithBackoff(async () => {
      console.log('[S2] Initializing Anthropic client...');
      // Initialize Anthropic client inside the retry function
      const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });

      console.log('[S2] Making API call to Claude...');
      return anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: TOKEN_LIMITS.s2,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
    }, 3, 2000);

    console.log('[S2] API call successful');

    // Extract text content
    const textContent = response.content.find(block => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      console.error('[S2] No text content in response');
      return NextResponse.json(
        { error: 'No text content in response' },
        { status: 500 }
      );
    }

    console.log('[S2] Response extracted, length:', textContent.text.length);

    return NextResponse.json({
      success: true,
      output: textContent.text,
      usage: response.usage,
    });

  } catch (error) {
    console.error('[S2] Generation error (detailed):', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    });

    return NextResponse.json(
      {
        error: 'S2 generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow up to 60 seconds for S2 generation
export const maxDuration = 60;
