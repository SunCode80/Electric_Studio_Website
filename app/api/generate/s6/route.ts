import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { s3Data, s4Data, s5Data } = await request.json();

    if (!s3Data || !s4Data || !s5Data) {
      return NextResponse.json(
        { error: 'S3, S4, and S5 data are all required for PDF generation' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'S6 PDF generation request received. Generate PDF on client-side.',
      data: {
        s3Data,
        s4Data,
        s5Data,
      }
    });
  } catch (error: any) {
    console.error('S6 generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to prepare PDF generation' },
      { status: 500 }
    );
  }
}
