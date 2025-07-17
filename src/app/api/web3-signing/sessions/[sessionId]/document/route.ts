import { NextRequest, NextResponse } from 'next/server';
import { Web3SigningContainer } from '../../../../../../infrastructure/di/web3-signing.container';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    console.log('=== GET /api/web3-signing/sessions/[sessionId]/document ===');
    
    const signingService = Web3SigningContainer.getSigningService();
    const params = await context.params;
    const sessionId = params.sessionId;
    
    console.log('Getting signed document for session:', sessionId);
    
    const documentBlob = await signingService.getSignedDocument(sessionId);
    
    console.log('Signed document retrieved, size:', documentBlob.size);
    
    const buffer = await documentBlob.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="signed_document_${sessionId}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('Error in GET document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get signed document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
