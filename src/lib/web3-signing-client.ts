import axios, { AxiosInstance } from 'axios';

export interface Session {
  sessionId: string;
  status: string;
  documentHash: string;
  signers: Array<{
    walletAddress: string;
    userId: number;
    status: string;
  }>;
}

export interface EIP712Domain {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    DocumentSignature: Array<{
      name: string;
      type: string;
    }>;
  };
}

export interface SignatureResponse {
  success: boolean;
  sessionStatus: string;
  signatureApplied: boolean;
  remainingSigners: string[];
  verificationUrl?: string;
}

export interface VerificationResponse {
  sessionId: string;
  signatureRequestId: number;
  verificationLink: string;
  status: string;
  completedSigners: number;
}

export class Web3SigningClient {
  private api: AxiosInstance;

  constructor() {
    // Use local API routes to avoid CORS issues
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    console.log('🔧 Web3SigningClient constructor:');
    console.log('  - Using proxy baseURL:', baseURL);

    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
        });
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        console.error('❌ API Error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            method: error.config?.method,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
          }
        });
        return Promise.reject(error);
      }
    );
  }
  /**
   * Crear una nueva sesión de firma
   */
  async createSession(
    file: File,
    walletAddress: string,
    sessionName?: string
  ): Promise<Session> {
    try {
      console.log('📄 Creating session:', {
        fileName: file.name,
        fileSize: file.size,
        walletAddress,
        sessionName,
      });

      const formData = new FormData();
      formData.append('sessionName', sessionName || `session_${Date.now()}`);
      formData.append(
        'expectedSigners',
        JSON.stringify([{ walletAddress, role: 'signer' }])
      );
      formData.append('document', file);

      // Override Content-Type for FormData
      const { data } = await this.api.post('/api/web3-signing/sessions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });      console.log('✅ Session created successfully:', data);
      return data;
    } catch (error: unknown) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }  /**
   * Obtener el dominio EIP-712 con chainId dinámico
   */
  async getEIP712Domain(chainId?: number): Promise<EIP712Domain> {
    const { data } = await this.api.get('/api/web3-signing/eip712-domain');
    
    // Si se proporciona un chainId, actualizar el dominio
    if (chainId && data.domain) {
      data.domain.chainId = chainId;
      console.log(`🔗 Updated EIP-712 domain chainId to: ${chainId}`);
    }
    
    return data;
  }

  /**
   * Enviar firma EIP-712
   */  async submitSignature(
    sessionId: string,
    signature: string,
    message: Record<string, unknown>,
    walletAddress: string
  ): Promise<SignatureResponse> {
    const { data } = await this.api.post('/api/web3-signing/sign', {
      sessionId,
      eip712Signature: {
        signature,
        message,
      },
      walletAddress,
    });
    return data;
  }
  /**
   * Obtener el estado de la sesión
   */
  async getSessionStatus(sessionId: string): Promise<{ status: string; signers?: Array<{ address: string; completed: boolean }> }> {
    const { data } = await this.api.get(`/api/web3-signing/sessions/${sessionId}/status`);
    return data;
  }

  /**
   * Obtener el enlace de verificación
   */
  async getVerificationLink(sessionId: string): Promise<VerificationResponse> {
    const { data } = await this.api.get(`/api/web3-signing/sessions/${sessionId}/verification-link`);
    return data;
  }

  /**
   * Descargar el documento firmado
   */
  async downloadDocument(sessionId: string): Promise<Blob> {
    const { data } = await this.api.get(`/api/web3-signing/sessions/${sessionId}/document`, {
      responseType: 'arraybuffer',
    });
    return new Blob([data], { type: 'application/pdf' });
  }
}

// Singleton instance
export const web3SigningClient = new Web3SigningClient();
