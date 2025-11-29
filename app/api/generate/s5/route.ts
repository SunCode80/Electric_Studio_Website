import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildS5Prompt, CLAUDE_MODEL, TOKEN_LIMITS } from '@/lib/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { s3Data } = await request.json();

    if (!s3Data) {
      return NextResponse.json(
        { error: 'S3 data is required' },
        { status: 400 }
      );
    }

    const prompt = buildS5Prompt(s3Data);

    let stream: any;
    try {
      stream = await anthropic.messages.stream({
        model: CLAUDE_MODEL,
        max_tokens: TOKEN_LIMITS.s5,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    } catch (apiError: any) {
      console.error('[S5] API error:', apiError);

      if (apiError.status === 401) {
        throw new Error('BILLING_ERROR: Invalid API key. Please check your Anthropic API key.');
      }

      if (apiError.status === 429) {
        throw new Error('RATE_LIMIT: Too many requests. Please try again in a moment.');
      }

      if (apiError.status === 402 || apiError.error?.type === 'insufficient_quota') {
        throw new Error('BILLING_ERROR: API credits exhausted. Please add credits at console.anthropic.com');
      }

      throw apiError;
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('S5 generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let statusCode = 500;
    let userMessage = 'Failed to generate stock library searches. Please try again.';

    if (errorMessage.includes('BILLING_ERROR')) {
      statusCode = 402;
      userMessage = 'Your Claude API credits have been exhausted. Please add credits at console.anthropic.com to continue generating content.';
    } else if (errorMessage.includes('RATE_LIMIT')) {
      statusCode = 429;
      userMessage = 'Too many requests. Please wait a moment and try again.';
    }

    return NextResponse.json(
      {
        error: statusCode === 402 ? 'API credits exhausted' : statusCode === 429 ? 'Rate limit exceeded' : 'S5 generation failed',
        details: errorMessage.replace('BILLING_ERROR: ', '').replace('RATE_LIMIT: ', ''),
        userMessage
      },
      { status: statusCode }
    );
  }
}
