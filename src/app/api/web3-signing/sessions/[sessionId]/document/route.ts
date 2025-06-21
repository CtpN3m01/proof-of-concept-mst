import { NextRequest, NextResponse } from 'next/server';

const AUTOPEN_BASE_URL = process.env.NEXT_PUBLIC_AUTOPEN_BASE_URL;
const AUTOPEN_API_KEY = process.env.NEXT_PUBLIC_AUTOPEN_API_KEY;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    if (!AUTOPEN_BASE_URL || !AUTOPEN_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration missing' },
        { status: 500 }
      );
    }

    const params = await context.params;
    const sessionId = params.sessionId;
    
    const response = await fetch(`${AUTOPEN_BASE_URL}/api/web3-signing/sessions/${sessionId}/document`, {
      method: 'GET',
      headers: {
        'X-API-Key': AUTOPEN_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AutoPen API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status}` },
        { status: response.status }
      );
    }

    // Para documentos PDF, devolver como stream
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="signed_document_${sessionId}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
