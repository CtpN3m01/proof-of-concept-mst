import { NextRequest, NextResponse } from 'next/server';
import { Web3SigningContainer } from '../../../../../../infrastructure/di/web3-signing.container';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    console.log('=== GET /api/web3-signing/sessions/[sessionId]/verification-link ===');
    
    const signingService = Web3SigningContainer.getSigningService();
    const params = await context.params;
    const sessionId = params.sessionId;
    
    console.log('Getting verification link for session:', sessionId);
    
    const verificationLink = await signingService.getVerificationLink(sessionId);
    
    console.log('Verification link retrieved:', verificationLink);
    
    return NextResponse.json({
      sessionId,
      verificationLink
    });
    
  } catch (error) {
    console.error('Error in GET verification-link:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get verification link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
