/**
 * API Route: /api/generate/s4
 * Generates S4 Assembly Instructions from S3 Production Package
 * Uses streaming for real-time output
 */

import { NextRequest } from 'next/server';
import { buildS4Prompt, CLAUDE_MODEL, TOKEN_LIMITS } from '@/lib/prompts';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { s3Data } = body;

    if (!s3Data) {
      return new Response(
        JSON.stringify({ error: 'S3 data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildS4Prompt(
      typeof s3Data === 'string' ? s3Data : JSON.stringify(s3Data, null, 2)
    );

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: TOKEN_LIMITS.s4,
        stream: true,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate S4 assembly instructions' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!response.body) {
      return new Response(
        JSON.stringify({ error: 'No response body from API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body!.getReader();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.type === 'content_block_delta' &&
                      parsed.delta?.type === 'text_delta') {
                    controller.enqueue(encoder.encode(parsed.delta.text));
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
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

export const maxDuration = 90;
