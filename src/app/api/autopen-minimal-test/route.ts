import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Testing Minimal Autopen API Call ===');
    
    // Test with the absolute minimum required data
    const formData = new FormData();
    
    // Create a simple PDF buffer  
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
    const buffer = Buffer.from(testPdfContent);
    
    // Create a blob-like object directly
    const blob = new Blob([buffer], { type: 'application/pdf' });
    
    // Only essential fields
    formData.append('document', blob, 'test.pdf');
    formData.append('signerAddress', '0x1234567890123456789012345678901234567890');
    
    console.log('📤 Testing with minimal FormData keys:', Array.from(formData.keys()));
    
    const autopenUrl = 'https://autopen.lucerolabs.xyz/api/web3-signing/sessions';
    console.log('🎯 Target URL:', autopenUrl);
    
    const response = await fetch(autopenUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_AUTOPEN_API_KEY || '',
      }
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Autopen API error',
        status: response.status,
        body: responseText
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: JSON.parse(responseText)
    });
    
  } catch (error) {
    console.log('💥 Error testing minimal Autopen API:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
