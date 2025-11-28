/**
 * API Route: /api/generate/s4
 * Generates S4 Assembly Instructions from S3 Production Package
 * 
 * Uses STREAMING for reliability on longer operations.
 * Includes retry logic for API overload errors.
 */

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildS4Prompt, CLAUDE_MODEL, TOKEN_LIMITS } from '@/lib/prompts';

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
    // Validate API key
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { s3Data } = body;
    
    if (!s3Data) {
      return new Response(
        JSON.stringify({ error: 'S3 data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Anthropic client with explicit authentication
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
      defaultHeaders: {
        'anthropic-version': '2023-06-01',
      },
    });
    
    // Build prompt
    const prompt = buildS4Prompt(
      typeof s3Data === 'string' ? s3Data : JSON.stringify(s3Data, null, 2)
    );
    
    // Use streaming for S4
    const stream = await retryWithBackoff(async () => {
      return anthropic.messages.stream({
        model: CLAUDE_MODEL,
        max_tokens: TOKEN_LIMITS.s4,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
    }, 3, 2000);
    
    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('S4 generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'S4 generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Allow up to 90 seconds for S4 generation
export const maxDuration = 90;
