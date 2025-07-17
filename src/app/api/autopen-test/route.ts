import { NextRequest, NextResponse } from 'next/server';

const AUTOPEN_BASE_URL = process.env.NEXT_PUBLIC_AUTOPEN_BASE_URL;
const AUTOPEN_API_KEY = process.env.NEXT_PUBLIC_AUTOPEN_API_KEY;

export async function GET() {
  try {
    console.log('=== Testing Autopen Connection ===');
    
    if (!AUTOPEN_BASE_URL || !AUTOPEN_API_KEY) {
      console.error('Missing environment variables:', {
        AUTOPEN_BASE_URL: !!AUTOPEN_BASE_URL,
        AUTOPEN_API_KEY: !!AUTOPEN_API_KEY
      });
      return NextResponse.json(
        { 
          error: 'Environment variables missing',
          hasBaseUrl: !!AUTOPEN_BASE_URL,
          hasApiKey: !!AUTOPEN_API_KEY
        },
        { status: 500 }
      );
    }

    console.log('Testing connection to:', AUTOPEN_BASE_URL);
    
    // Probar una conexión simple
    const testUrl = `${AUTOPEN_BASE_URL}/health` || `${AUTOPEN_BASE_URL}/`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': AUTOPEN_API_KEY,
          'User-Agent': 'NextJS-Client/1.0'
        },
      });
      
      console.log('Test response status:', response.status);
      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Test response body:', responseText);
      
      return NextResponse.json({
        success: true,
        status: response.status,
        baseUrl: AUTOPEN_BASE_URL,
        response: responseText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({
        error: 'Connection failed',
        baseUrl: AUTOPEN_BASE_URL,
        details: fetchError instanceof Error ? fetchError.message : String(fetchError)
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
