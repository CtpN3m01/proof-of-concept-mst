import { 
  AutopenSessionRequest, 
  AutopenSessionResponse, 
  AutopenSignResult, 
  EIP712Domain,
  SigningError,
  SigningErrorCode 
} from '../../domain/model/web3-signing';

export interface AutopenRepository {
  createSession(request: AutopenSessionRequest): Promise<AutopenSessionResponse>;
  signDocument(sessionId: string, signature: string): Promise<AutopenSignResult>;
  getEIP712Domain(): Promise<EIP712Domain>;
  getVerificationLink(sessionId: string): Promise<string>;
  getSignedDocument(sessionId: string): Promise<Blob>;
  verifySignature(sessionId: string): Promise<boolean>;
}

export class AutopenRepositoryImpl implements AutopenRepository {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AUTOPEN_BASE_URL!;
    this.apiKey = process.env.NEXT_PUBLIC_AUTOPEN_API_KEY!;

    if (!this.baseUrl || !this.apiKey) {
      throw new Error('AutoPen configuration missing');
    }
  }

  async createSession(request: AutopenSessionRequest): Promise<AutopenSessionResponse> {
    console.log('=== AutopenRepository.createSession ===');
    console.log('Base URL:', this.baseUrl);
    console.log('Has API Key:', !!this.apiKey);

    const formData = new FormData();
    formData.append('document', request.document);
    formData.append('signerAddress', request.signerAddress);
    formData.append('userID', request.userID);
    formData.append('message', request.message);
    formData.append('timestamp', request.timestamp);

    console.log('FormData keys:', Array.from(formData.keys()));

    const response = await fetch(`${this.baseUrl}/api/web3-signing/sessions`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AutoPen API Error:', errorText);
      throw new SigningError(
        `AutoPen API Error: ${response.status}`,
        SigningErrorCode.AUTOPEN_API_ERROR,
        errorText
      );
    }

    const data = await response.json();
    console.log('AutoPen session response:', data);
    return data;
  }

  async signDocument(sessionId: string, signature: string): Promise<AutopenSignResult> {
    console.log('=== AutopenRepository.signDocument ===');
    console.log('SessionId:', sessionId);

    const response = await fetch(`${this.baseUrl}/api/web3-signing/sign`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        signature
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AutoPen Sign API Error:', errorText);
      throw new SigningError(
        `AutoPen Sign API Error: ${response.status}`,
        SigningErrorCode.AUTOPEN_API_ERROR,
        errorText
      );
    }

    const data = await response.json();
    console.log('AutoPen sign response:', data);
    
    // Obtener verification link
    const verificationLink = await this.getVerificationLink(sessionId);
    
    return {
      verificationLink,
      documentUrl: `${this.baseUrl}/api/web3-signing/sessions/${sessionId}/document`
    };
  }

  async getEIP712Domain(): Promise<EIP712Domain> {
    console.log('=== AutopenRepository.getEIP712Domain ===');

    const response = await fetch(`${this.baseUrl}/api/web3-signing/eip712-domain`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AutoPen EIP712 API Error:', errorText);
      throw new SigningError(
        `AutoPen EIP712 API Error: ${response.status}`,
        SigningErrorCode.AUTOPEN_API_ERROR,
        errorText
      );
    }

    const data = await response.json();
    console.log('EIP712 domain:', data);
    return data;
  }

  async getVerificationLink(sessionId: string): Promise<string> {
    console.log('=== AutopenRepository.getVerificationLink ===');
    console.log('SessionId:', sessionId);

    const response = await fetch(
      `${this.baseUrl}/api/web3-signing/sessions/${sessionId}/verification-link`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AutoPen Verification Link API Error:', errorText);
      throw new SigningError(
        `AutoPen Verification Link API Error: ${response.status}`,
        SigningErrorCode.AUTOPEN_API_ERROR,
        errorText
      );
    }

    const data = await response.json();
    console.log('Verification link response:', data);
    return data.verificationLink || data.link || data.url;
  }

  async getSignedDocument(sessionId: string): Promise<Blob> {
    console.log('=== AutopenRepository.getSignedDocument ===');
    console.log('SessionId:', sessionId);

    const response = await fetch(
      `${this.baseUrl}/api/web3-signing/sessions/${sessionId}/document`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AutoPen Document API Error:', errorText);
      throw new SigningError(
        `AutoPen Document API Error: ${response.status}`,
        SigningErrorCode.AUTOPEN_API_ERROR,
        errorText
      );
    }

    return response.blob();
  }

  async verifySignature(sessionId: string): Promise<boolean> {
    console.log('=== AutopenRepository.verifySignature ===');
    console.log('SessionId:', sessionId);

    try {
      const link = await this.getVerificationLink(sessionId);
      return !!link;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}
