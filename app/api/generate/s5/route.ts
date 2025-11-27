import { NextRequest, NextResponse } from 'next/server';
import { generateS5Prompt } from '@/lib/prompts';
import { S1SurveyData, S2PresentationData, S3VideoProductionData, S4AssemblyData, S5MasterGuide } from '@/lib/types/pipeline';

export async function POST(request: NextRequest) {
  try {
    const { s1Data, s2Data, s3Data, s4Data, submissionId } = await request.json();

    if (!s1Data || !s2Data || !s3Data || !s4Data) {
      return NextResponse.json(
        { error: 'S1, S2, S3, and S4 data are required' },
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

    const prompt = generateS5Prompt(
      s1Data as S1SurveyData,
      s2Data as S2PresentationData,
      s3Data as S3VideoProductionData,
      s4Data as S4AssemblyData
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
        { error: 'Failed to generate S5 master guide' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    let s5Data: S5MasterGuide;
    try {
      s5Data = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content);
      return NextResponse.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ s5Data, submissionId });
  } catch (error) {
    console.error('Error generating S5 master guide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
