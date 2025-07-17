import { NextRequest, NextResponse } from 'next/server';

const AUTOPEN_BASE_URL = process.env.NEXT_PUBLIC_AUTOPEN_BASE_URL;
const AUTOPEN_API_KEY = process.env.NEXT_PUBLIC_AUTOPEN_API_KEY;

export async function GET(request: NextRequest) {
  console.log('=== Testing Direct Autopen API Call ===');
  
  try {
    if (!AUTOPEN_BASE_URL || !AUTOPEN_API_KEY) {
      return NextResponse.json({
        error: 'Missing configuration',
        config: {
          hasBaseUrl: !!AUTOPEN_BASE_URL,
          hasApiKey: !!AUTOPEN_API_KEY
        }
      });
    }

    // Crear FormData de prueba
    const formData = new FormData();
    
    // Crear un blob de prueba simple (simulando un PDF)
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
    const blob = new Blob([testPdfContent], { type: 'application/pdf' });
    
    // En Node.js, necesitamos usar el blob directamente
    formData.append('document', blob, 'test.pdf');
    formData.append('signerAddress', '0x1234567890123456789012345678901234567890');
    formData.append('signature', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab1b');
    formData.append('message', 'Test message for signing');
    formData.append('documentHash', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab');
    formData.append('userID', 'test-user-123');
    formData.append('timestamp', new Date().toISOString());

    console.log('📤 Testing with FormData keys:', Array.from(formData.keys()));
    
    const targetUrl = `${AUTOPEN_BASE_URL}/api/web3-signing/sessions`;
    console.log('🎯 Target URL:', targetUrl);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': AUTOPEN_API_KEY,
      },
      body: formData,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      config: {
        baseUrl: AUTOPEN_BASE_URL,
        hasApiKey: !!AUTOPEN_API_KEY
      }
    });

  } catch (error) {
    console.error('💥 Error testing Autopen API:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
