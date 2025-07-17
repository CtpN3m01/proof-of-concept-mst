export interface SigningSession {
  sessionId: string;
  documentHash: string;
  signerAddress: string;
  signature: string;
  message: string;
  userID: string;
  timestamp: string;
  status: SigningStatus;
  verificationLink?: string;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SigningStatus = 'pending' | 'signed' | 'verified' | 'failed' | 'expired';

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface SigningRequest {
  document: File | Blob;
  signerAddress: string;
  userID: string;
  message?: string;
  metadata?: Record<string, any>;
}

export interface SigningResult {
  sessionId: string;
  signature: string;
  documentHash: string;
  verificationLink: string;
  signedDocumentUrl: string;
  status: SigningStatus;
}

export interface DocumentSignature {
  signature: string;
  signerAddress: string;
  documentHash: string;
  timestamp: string;
  blockchainTxHash?: string;
}

// Errores específicos del dominio
export class SigningError extends Error {
  constructor(
    message: string,
    public code: SigningErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'SigningError';
  }
}

export enum SigningErrorCode {
  INVALID_DOCUMENT = 'INVALID_DOCUMENT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  AUTOPEN_API_ERROR = 'AUTOPEN_API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Interfaces para repositorios
export interface AutopenSessionRequest {
  document: File | Blob;
  signerAddress: string;
  userID: string;
  message: string;
  timestamp: string;
}

export interface AutopenSessionResponse {
  sessionId: string;
  documentHash: string;
  timestamp: string;
}

export interface AutopenSignResult {
  verificationLink: string;
  documentUrl: string;
}
