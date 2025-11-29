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

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: TOKEN_LIMITS.s5,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

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
    return NextResponse.json(
      { error: error.message || 'Failed to generate stock library searches' },
      { status: 500 }
    );
  }
}
