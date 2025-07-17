import { NextRequest, NextResponse } from 'next/server';
import { Web3SigningContainer } from '../../../../infrastructure/di/web3-signing.container';
import { SigningRequest } from '../../../../domain/model/web3-signing';

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/web3-signing/sessions ===');
    
    const signingService = Web3SigningContainer.getSigningService();
    const formData = await request.formData();
    
    // Extraer datos del FormData
    const document = formData.get('document') as File;
    const signerAddress = formData.get('signerAddress') as string;
    const userID = formData.get('userID') as string;
    const message = formData.get('message') as string;

    console.log('Request data:', {
      hasDocument: !!document,
      documentName: document?.name,
      documentSize: document?.size,
      signerAddress,
      userID,
      message
    });

    if (!document || !signerAddress || !userID) {
      return NextResponse.json(
        { error: 'Missing required fields: document, signerAddress, userID' },
        { status: 400 }
      );
    }

    // Crear la request usando el servicio
    const signingRequest: SigningRequest = {
      document,
      signerAddress,
      userID,
      message: message || 'Document signing request'
    };

    const session = await signingService.createSigningSession(signingRequest);
    
    console.log('Session created successfully:', session.sessionId);
    
    return NextResponse.json({
      sessionId: session.sessionId,
      documentHash: session.documentHash,
      timestamp: session.timestamp,
      status: session.status
    });

  } catch (error) {
    console.error('Error in POST /api/web3-signing/sessions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create signing session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
