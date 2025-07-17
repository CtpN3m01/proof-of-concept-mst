import { 
  SigningSession, 
  SigningRequest, 
  SigningResult, 
  EIP712Domain, 
  SigningError, 
  SigningErrorCode,
  SigningStatus 
} from '../model/web3-signing';
import { AutopenRepository } from '@/infrastructure/repositories/autopen.repository';
import { SigningSessionRepository } from '@/infrastructure/repositories/signing-session.repository';

export interface Web3SigningService {
  /**
   * Crear una nueva sesión de firma
   */
  createSigningSession(request: SigningRequest): Promise<SigningSession>;

  /**
   * Obtener una sesión de firma por ID
   */
  getSigningSession(sessionId: string): Promise<SigningSession>;

  /**
   * Firmar un documento
   */
  signDocument(sessionId: string, signature: string): Promise<SigningResult>;

  /**
   * Obtener el dominio EIP712 para firma
   */
  getEIP712Domain(): Promise<EIP712Domain>;

  /**
   * Obtener link de verificación
   */
  getVerificationLink(sessionId: string): Promise<string>;

  /**
   * Descargar documento firmado
   */
  getSignedDocument(sessionId: string): Promise<Blob>;

  /**
   * Verificar una firma
   */
  verifySignature(sessionId: string): Promise<boolean>;

  /**
   * Listar sesiones de un usuario
   */
  getUserSessions(userID: string): Promise<SigningSession[]>;

  /**
   * Cancelar/eliminar una sesión
   */
  cancelSession(sessionId: string): Promise<void>;
}

export class Web3SigningServiceImpl implements Web3SigningService {
  constructor(
    private autopenRepository: AutopenRepository,
    private sessionRepository: SigningSessionRepository
  ) {}

  async createSigningSession(request: SigningRequest): Promise<SigningSession> {
    try {
      console.log('=== Web3SigningService.createSigningSession ===');
      console.log('Request:', { 
        userID: request.userID, 
        signerAddress: request.signerAddress,
        documentSize: request.document.size,
        documentType: request.document.type 
      });

      // Validar documento
      this.validateDocument(request.document);

      // Crear sesión en AutoPen
      const autopenSession = await this.autopenRepository.createSession({
        document: request.document,
        signerAddress: request.signerAddress,
        userID: request.userID,
        message: request.message || 'Document signing request',
        timestamp: new Date().toISOString()
      });

      console.log('AutoPen session created:', autopenSession);

      // Crear sesión local
      const session: SigningSession = {
        sessionId: autopenSession.sessionId,
        documentHash: autopenSession.documentHash,
        signerAddress: request.signerAddress,
        signature: '', // Se llenará al firmar
        message: request.message || 'Document signing request',
        userID: request.userID,
        timestamp: autopenSession.timestamp,
        status: 'pending' as SigningStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Guardar en repositorio local
      await this.sessionRepository.save(session);

      console.log('Local session saved:', session.sessionId);
      return session;
    } catch (error) {
      console.error('Error creating signing session:', error);
      if (error instanceof SigningError) throw error;
      throw new SigningError(
        'Failed to create signing session',
        SigningErrorCode.AUTOPEN_API_ERROR,
        error
      );
    }
  }

  async signDocument(sessionId: string, signature: string): Promise<SigningResult> {
    try {
      console.log('=== Web3SigningService.signDocument ===');
      console.log('SessionId:', sessionId);

      // Obtener sesión
      const session = await this.getSigningSession(sessionId);

      // Firmar en AutoPen
      const signResult = await this.autopenRepository.signDocument(sessionId, signature);

      // Actualizar sesión local
      session.signature = signature;
      session.status = 'signed' as SigningStatus;
      session.verificationLink = signResult.verificationLink;
      session.documentUrl = signResult.documentUrl;
      session.updatedAt = new Date();

      await this.sessionRepository.update(session);

      const result: SigningResult = {
        sessionId,
        signature,
        documentHash: session.documentHash,
        verificationLink: signResult.verificationLink,
        signedDocumentUrl: signResult.documentUrl,
        status: 'signed' as SigningStatus
      };

      console.log('Document signed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error signing document:', error);
      throw new SigningError(
        'Failed to sign document',
        SigningErrorCode.AUTOPEN_API_ERROR,
        error
      );
    }
  }

  async getEIP712Domain(): Promise<EIP712Domain> {
    console.log('=== Web3SigningService.getEIP712Domain ===');
    return this.autopenRepository.getEIP712Domain();
  }

  async getVerificationLink(sessionId: string): Promise<string> {
    console.log('=== Web3SigningService.getVerificationLink ===');
    console.log('SessionId:', sessionId);
    
    const session = await this.getSigningSession(sessionId);
    if (session.verificationLink) {
      return session.verificationLink;
    }
    return this.autopenRepository.getVerificationLink(sessionId);
  }

  async getSignedDocument(sessionId: string): Promise<Blob> {
    console.log('=== Web3SigningService.getSignedDocument ===');
    console.log('SessionId:', sessionId);
    
    return this.autopenRepository.getSignedDocument(sessionId);
  }

  async verifySignature(sessionId: string): Promise<boolean> {
    console.log('=== Web3SigningService.verifySignature ===');
    console.log('SessionId:', sessionId);
    
    try {
      const session = await this.getSigningSession(sessionId);
      return this.autopenRepository.verifySignature(sessionId);
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  async getUserSessions(userID: string): Promise<SigningSession[]> {
    console.log('=== Web3SigningService.getUserSessions ===');
    console.log('UserID:', userID);
    
    return this.sessionRepository.findByUserID(userID);
  }

  async cancelSession(sessionId: string): Promise<void> {
    console.log('=== Web3SigningService.cancelSession ===');
    console.log('SessionId:', sessionId);
    
    await this.sessionRepository.delete(sessionId);
    // Nota: AutoPen no parece tener endpoint para cancelar
  }

  async getSigningSession(sessionId: string): Promise<SigningSession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new SigningError(
        'Session not found',
        SigningErrorCode.SESSION_NOT_FOUND
      );
    }
    return session;
  }

  private validateDocument(document: File | Blob): void {
    if (!document) {
      throw new SigningError(
        'Document is required',
        SigningErrorCode.INVALID_DOCUMENT
      );
    }

    if (document.type !== 'application/pdf') {
      throw new SigningError(
        'Only PDF documents are supported',
        SigningErrorCode.INVALID_DOCUMENT
      );
    }

    // Validar tamaño (ej: máximo 10MB)
    if (document.size > 10 * 1024 * 1024) {
      throw new SigningError(
        'Document too large (max 10MB)',
        SigningErrorCode.INVALID_DOCUMENT
      );
    }
  }
}
