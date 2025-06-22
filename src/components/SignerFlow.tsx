'use client';

import { useState, useEffect } from 'react';
import { walletManager, UserWallet } from '@/lib/wallet-manager';
import { web3SigningClient } from '@/lib/web3-signing-client';
import { checkEnvironmentVariables } from '@/lib/env-check';
import DiagnosticPanel from './DiagnosticPanel';

type SessionState = { 
  id: string; 
  hash: string; 
  status: string;
  verificationUrl?: string;
};

export default function SignerFlow() {
  const [currentWallet, setCurrentWallet] = useState<UserWallet | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [signProgress, setSignProgress] = useState(false);
  const [envCheck, setEnvCheck] = useState(false);

  useEffect(() => {
    // Check environment variables on component mount
    const isEnvOk = checkEnvironmentVariables();
    setEnvCheck(isEnvOk);
    
    // Check if there's already a logged in user
    const existingWallet = walletManager.getCurrentWallet();
    const existingUserId = walletManager.getCurrentUserId();
    if (existingWallet && existingUserId) {
      setCurrentWallet(existingWallet);
      setUserId(existingUserId);
    }
  }, []);

  /* Función para hacer "login" con UserID */
  function handleLogin() {
    if (!userId.trim()) {
      alert('Por favor ingresa un UserID');
      return;
    }

    try {
      const wallet = walletManager.loginWithUserId(userId);
      setCurrentWallet(wallet);
      alert(`✅ Usuario logeado exitosamente!\nWallet: ${wallet.address}`);
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error al crear la wallet. Inténtalo de nuevo.');
    }
  }

  /* Función para logout */
  function handleLogout() {
    walletManager.logout();
    setCurrentWallet(null);
    setUserId('');
    setSession(null);
  }  /* 1. Crear sesión y subir PDF */
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentWallet) return;

    setUploadProgress(true);
    try {
      console.log('📄 Starting file upload process...');
      
      const data = await web3SigningClient.createSession(
        file,
        currentWallet.address,
        'lease_contract_demo_ui'
      );
      setSession({ 
        id: data.sessionId, 
        hash: data.documentHash,
        status: data.status
      });
      
      console.log('✅ File uploaded successfully!');
    } catch (error: unknown) {
      console.error('❌ Error creating session:', error);
      
      let errorMessage = 'Error al crear la sesión. Inténtalo de nuevo.';
      
      if (error instanceof Error) {
        if (error.message === 'Network Error') {
          errorMessage = '❌ Error de red: Verifica tu conexión y las variables de entorno (AUTOPEN_BASE_URL y AUTOPEN_API_KEY)';
        }
      }
        // Check if it's an axios error with response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          errorMessage = '❌ Error de autenticación: Verifica tu AUTOPEN_API_KEY';
        } else if (axiosError.response?.status === 404) {
          errorMessage = '❌ Endpoint no encontrado: Verifica tu AUTOPEN_BASE_URL';
        } else if (axiosError.response?.data?.message) {
          errorMessage = `❌ ${axiosError.response.data.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setUploadProgress(false);
    }
  }

  /* 2. Pedir firma al usuario y enviarla */
  async function signAndSend() {
    if (!session || !currentWallet) return;

    setSignProgress(true);
    setBusy(true);
    try {
      /* Usar chainId por defecto (Ethereum mainnet) */
      const chainId = 1;
      console.log('🔗 Using chainId:', chainId);
      
      /* Obtener dominio y tipos desde backend con chainId dinámico */
      const { domain, types } = await web3SigningClient.getEIP712Domain(chainId);

      const message = {
        sessionId: session.id,
        walletAddress: currentWallet.address,
        documentHash: session.hash,
        timestamp: Math.floor(Date.now() / 1000),
      };

      console.log('📝 Signing with domain:', domain);
      console.log('📝 Signing message:', message);

      const signature = await walletManager.signTypedData(domain, types, message);

      const result = await web3SigningClient.submitSignature(
        session.id,
        signature,
        message,
        currentWallet.address
      );

      setSession(prev => prev ? {
        ...prev,
        status: result.sessionStatus,
        verificationUrl: result.verificationUrl
      } : null);      
      
      alert('✅ Firma enviada exitosamente. El documento está siendo procesado.');
    } catch (error: unknown) {
      console.error('❌ Error signing document:', error);
      
      let errorMessage = 'Error al firmar el documento. Inténtalo de nuevo.';
      
      if (error instanceof Error) {
        if (error.message === 'Network Error') {
          errorMessage = '❌ Error de red al enviar la firma. Verifica tu conexión.';
        } else if (error.message?.includes('User rejected')) {
          errorMessage = '❌ Firma cancelada por el usuario';
        }
      }
        // Check if it's an axios error with response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 400) {
          errorMessage = '❌ Error en la firma: Verifica que el documento y la wallet sean correctos';
        } else if (axiosError.response?.data?.message) {
          errorMessage = `❌ ${axiosError.response.data.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setBusy(false);
      setSignProgress(false);
    }
  }

  /* 3. Descargar PDF cuando esté listo */
  async function downloadPdf() {
    if (!session) return;
    
    try {
      const blob = await web3SigningClient.downloadDocument(session.id);
      const blobUrl = URL.createObjectURL(blob);
      
      // Crear un enlace de descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `signed_document_${session.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar el documento. Inténtalo de nuevo.');
    }
  }

  /* 4. Obtener enlace de verificación */
  async function getVerificationLink() {
    if (!session) return;
    
    try {
      const result = await web3SigningClient.getVerificationLink(session.id);
      setSession(prev => prev ? {
        ...prev,
        verificationUrl: result.verificationLink
      } : null);
    } catch (error) {
      console.error('Error getting verification link:', error);
    }
  }  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">      
    {/* Environment Check Alert */}
      {!envCheck && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Variables de Entorno Faltantes
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  Revisa la consola del navegador y configura las variables en .env.local
                </p>
              </div>
            </div>
          </div>
          <DiagnosticPanel />
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Firma de Documentos Web3
        </h1>
        <p className="text-gray-600">
          Ingresa tu UserID para generar una wallet y firmar documentos de forma segura
        </p>
      </div>      
      
      {/* User Login */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Iniciar Sesión</h2>
        
        {!currentWallet ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                Ingresa tu UserID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ej: 1234, user123, etc."
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!userId.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              🔐 Generar Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Usuario: <span className="font-mono">{walletManager.getCurrentUserId()}</span>
              </p>
              <p className="text-sm text-green-800 mt-1">
                🔗 Wallet: <span className="font-mono text-xs">{currentWallet.address}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              👋 Cerrar Sesión
            </button>
          </div>
        )}
      </div>
      
      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Subir Documento PDF</h2>
        
        <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFile} 
            className="hidden" 
            disabled={!currentWallet || uploadProgress}
          />
          
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <div className="text-sm font-medium text-gray-700">
              {uploadProgress ? 'Subiendo...' : 'Haz clic para subir tu PDF'}
            </div>
            <div className="text-xs text-gray-500">
              Máximo 10MB
            </div>
          </div>
        </label>

        {session && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              ✅ Documento cargado exitosamente
            </p>
            <p className="text-xs text-blue-600 mt-1 font-mono">
              ID: {session.id.slice(0, 8)}...
            </p>
            <p className="text-xs text-blue-600 font-mono">
              Estado: {session.status}
            </p>
          </div>
        )}
      </div>      
      
      {/* Signing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Firmar Documento</h2>
        <button
          onClick={signAndSend}
          disabled={!session || !currentWallet || busy || signProgress}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {signProgress ? (
            <span className="flex items-center justify-center text-white">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Firmando documento...
            </span>
          ) : (
            <span className="text-white">🖊️ Firmar con Wallet</span>
          )}
        </button>

        {session?.status === 'complete' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              ✅ Documento firmado exitosamente
            </p>
          </div>
        )}
      </div>

      {/* Download & Verification */}
      {session && (        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Descargar y Verificar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            
            <button
              onClick={downloadPdf}
              disabled={!session}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
            >
              <span className="text-white">📥 Descargar PDF Firmado</span>
            </button>

            <button
              onClick={getVerificationLink}
              disabled={!session}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
            >
              <span className="text-white">🔗 Obtener Enlace de Verificación</span>
            </button>
          </div>

          {session.verificationUrl && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800 font-medium mb-2">
                🔗 Enlace de Verificación Público:
              </p>
              <a 
                href={session.verificationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-800 underline break-all"
              >
                {session.verificationUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Status Footer */}
      {session && (
        <div className="text-center text-sm text-gray-500">
          <p>ID de Sesión: <span className="font-mono">{session.id}</span></p>
        </div>
      )}
    </div>
  );
}
