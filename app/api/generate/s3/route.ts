import { NextRequest, NextResponse } from 'next/server';
import { generateS3Prompt } from '@/lib/prompts';
import { S1SurveyData, S2PresentationData, S3VideoProductionData } from '@/lib/types/pipeline';

export async function POST(request: NextRequest) {
  try {
    const { s1Data, s2Data, submissionId } = await request.json();

    if (!s1Data || !s2Data) {
      return NextResponse.json(
        { error: 'S1 and S2 data are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const prompt = generateS3Prompt(
      s1Data as S1SurveyData,
      s2Data as S2PresentationData
    );

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate S3 video production data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    let s3Data: S3VideoProductionData;
    try {
      s3Data = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content);
      return NextResponse.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ s3Data, submissionId });
  } catch (error) {
    console.error('Error generating S3 video production data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
