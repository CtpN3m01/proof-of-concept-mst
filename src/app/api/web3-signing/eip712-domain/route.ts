import { NextResponse } from 'next/server';
import { Web3SigningContainer } from '../../../../infrastructure/di/web3-signing.container';

export async function GET() {
  try {
    console.log('=== GET /api/web3-signing/eip712-domain ===');
    
    const signingService = Web3SigningContainer.getSigningService();
    const domain = await signingService.getEIP712Domain();
    
    console.log('EIP712 domain retrieved:', domain);
    
    return NextResponse.json(domain);
    
  } catch (error) {
    console.error('Error in GET /api/web3-signing/eip712-domain:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get EIP712 domain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
