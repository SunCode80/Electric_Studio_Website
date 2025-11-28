import Anthropic from '@anthropic-ai/sdk';
import {
  S2_GENERATION_INSTRUCTIONS,
  S3_GENERATION_INSTRUCTIONS,
  S4_GENERATION_INSTRUCTIONS,
} from '@/lib/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface GenerationOptions {
  onProgress?: (chunk: string) => void;
  maxRetries?: number;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function generateS2(
  s1Data: string,
  options: GenerationOptions = {}
): Promise<string> {
  return retryWithBackoff(async () => {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${S2_GENERATION_INSTRUCTIONS}\n\nSurvey Data:\n${s1Data}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format');
  }, options.maxRetries);
}

export async function generateS3(
  s1Data: string,
  s2Data: string,
  options: GenerationOptions = {}
): Promise<string> {
  return retryWithBackoff(async () => {
    let fullContent = '';

    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `${S3_GENERATION_INSTRUCTIONS}\n\nSurvey Data (S1):\n${s1Data}\n\nPresentation Outline (S2):\n${s2Data}`,
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const text = chunk.delta.text;
        fullContent += text;
        if (options.onProgress) {
          options.onProgress(text);
        }
      }
    }

    return fullContent;
  }, options.maxRetries);
}

export async function generateS4(
  s3Data: string,
  options: GenerationOptions = {}
): Promise<string> {
  return retryWithBackoff(async () => {
    let fullContent = '';

    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${S4_GENERATION_INSTRUCTIONS}\n\nVideo Production Package (S3):\n${s3Data}`,
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const text = chunk.delta.text;
        fullContent += text;
        if (options.onProgress) {
          options.onProgress(text);
        }
      }
    }

    return fullContent;
  }, options.maxRetries);
}

export async function generateStage(
  stage: number,
  inputData: any,
  options: GenerationOptions = {}
): Promise<string> {
  switch (stage) {
    case 2:
      return generateS2(inputData.s1, options);
    case 3:
      return generateS3(inputData.s1, inputData.s2, options);
    case 4:
      return generateS4(inputData.s3, options);
    default:
      throw new Error(`Invalid stage: ${stage}`);
  }
}
