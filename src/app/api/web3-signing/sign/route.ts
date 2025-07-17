import { NextRequest, NextResponse } from 'next/server';
import { Web3SigningContainer } from '../../../../infrastructure/di/web3-signing.container';

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/web3-signing/sign ===');
    
    const signingService = Web3SigningContainer.getSigningService();
    const body = await request.json();
    
    const { sessionId, signature } = body;
    
    console.log('Sign request:', { sessionId, hasSignature: !!signature });

    if (!sessionId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, signature' },
        { status: 400 }
      );
    }

    const result = await signingService.signDocument(sessionId, signature);
    
    console.log('Document signed successfully:', result.sessionId);
    
    return NextResponse.json({
      sessionId: result.sessionId,
      signature: result.signature,
      verificationLink: result.verificationLink,
      signedDocumentUrl: result.signedDocumentUrl,
      status: result.status
    });
    
  } catch (error) {
    console.error('Error in POST /api/web3-signing/sign:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sign document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
