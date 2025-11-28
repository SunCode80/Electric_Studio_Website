/**
 * API Route: /api/generate/s3
 * Generates S3 Video Production Package from S2 Presentation
 * 
 * Uses STREAMING for reliability on longer operations (60-90 seconds).
 * Includes retry logic for API overload errors.
 */

import { NextRequest } from 'next/server';
import { buildS3Prompt, CLAUDE_MODEL, TOKEN_LIMITS } from '@/lib/prompts';

function getAnthropicApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return key;
}

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
    // Get API key
    const apiKey = getAnthropicApiKey();

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

    // Use streaming for S3 (long operation) with direct fetch
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: CLAUDE_MODEL,
              max_tokens: TOKEN_LIMITS.s3,
              messages: [{
                role: 'user',
                content: prompt
              }],
              stream: true
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${JSON.stringify(errorData)}`);
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response body');

          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const event = JSON.parse(data);
                  if (event.type === 'content_block_delta' && event.delta?.text) {
                    controller.enqueue(encoder.encode(event.delta.text));
                  }
                } catch (e) {
                  console.error('Failed to parse SSE:', e);
                }
              }
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
