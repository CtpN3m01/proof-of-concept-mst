import { NextResponse } from 'next/server';

const AUTOPEN_BASE_URL = process.env.NEXT_PUBLIC_AUTOPEN_BASE_URL;
const AUTOPEN_API_KEY = process.env.NEXT_PUBLIC_AUTOPEN_API_KEY;

export async function GET() {
  try {
    if (!AUTOPEN_BASE_URL || !AUTOPEN_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration missing' },
        { status: 500 }
      );
    }

    const response = await fetch(`${AUTOPEN_BASE_URL}/api/web3-signing/eip712-domain`, {
      method: 'GET',
      headers: {
        'X-API-Key': AUTOPEN_API_KEY,
        'Content-Type': 'application/json',
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

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
