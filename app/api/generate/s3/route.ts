/**
 * API Route: /api/generate/s3
 * Generates S3 Video Production Package from S2 Presentation
 * 
 * Uses STREAMING for reliability on longer operations (60-90 seconds).
 * Includes retry logic for API overload errors.
 */

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildS3Prompt, CLAUDE_MODEL, TOKEN_LIMITS } from '@/lib/prompts';

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
    const { s2Data } = body;
    
    if (!s2Data) {
      return new Response(
        JSON.stringify({ error: 'S2 data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Build prompt
    const prompt = buildS3Prompt(
      typeof s2Data === 'string' ? s2Data : JSON.stringify(s2Data, null, 2)
    );

    // Use streaming for S3 (long operation)
    const stream = await retryWithBackoff(async () => {
      // Initialize Anthropic client inside the retry function
      const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });

      return anthropic.messages.stream({
        model: CLAUDE_MODEL,
        max_tokens: TOKEN_LIMITS.s3,
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
    console.error('S3 generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'S3 generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Allow up to 2 minutes for S3 generation (streaming)
export const maxDuration = 120;
