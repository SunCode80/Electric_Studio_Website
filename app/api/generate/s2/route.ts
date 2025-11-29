/**
 * API Route: /api/generate/s2
 * Generates S2 Presentation from S1 Survey Data
 * 
 * Uses standard request/response (not streaming) since S2 is typically fast.
 * Includes retry logic for API overload errors.
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildS2Prompt, CLAUDE_MODEL, TOKEN_LIMITS } from '@/lib/prompts';

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
    console.log('[S2] Starting generation...');

    // Get API key
    const apiKey = getAnthropicApiKey();
    console.log('[S2] API key present:', apiKey.substring(0, 20) + '...');

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

    // Generate S2 with retry logic using direct fetch
    const response = await retryWithBackoff(async () => {
      console.log('[S2] Making direct API call to Claude...');

      const fetchResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: TOKEN_LIMITS.s2,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}));
        console.error('[S2] API error:', errorData);

        if (fetchResponse.status === 401) {
          throw new Error('BILLING_ERROR: Invalid API key. Please check your Anthropic API key.');
        }

        if (fetchResponse.status === 429) {
          throw new Error('RATE_LIMIT: Too many requests. Please try again in a moment.');
        }

        if (fetchResponse.status === 402 || errorData?.error?.type === 'insufficient_quota') {
          throw new Error('BILLING_ERROR: API credits exhausted. Please add credits at console.anthropic.com');
        }

        const errorMessage = errorData?.error?.message || JSON.stringify(errorData);
        throw new Error(`API error: ${errorMessage}`);
      }

      const result = await fetchResponse.json();

      if (!result || !result.content || result.content.length === 0) {
        throw new Error('Empty response from Claude API');
      }

      return result;
    }, 3, 2000);

    console.log('[S2] API call successful');

    // Extract text content
    const textContent = response.content.find((block: any) => block.type === 'text');

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

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('BILLING_ERROR')) {
      return NextResponse.json(
        {
          error: 'API credits exhausted',
          details: errorMessage.replace('BILLING_ERROR: ', ''),
          userMessage: 'Your Claude API credits have been exhausted. Please add credits at console.anthropic.com to continue generating content.'
        },
        { status: 402 }
      );
    }

    if (errorMessage.includes('RATE_LIMIT')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: errorMessage.replace('RATE_LIMIT: ', ''),
          userMessage: 'Too many requests. Please wait a moment and try again.'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'S2 generation failed',
        details: errorMessage,
        userMessage: 'Failed to generate presentation content. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Allow up to 60 seconds for S2 generation
export const maxDuration = 60;
