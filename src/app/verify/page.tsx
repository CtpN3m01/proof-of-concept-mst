'use client';

import { useState } from 'react';
import Link from 'next/link';
import { web3SigningClient } from '@/lib/web3-signing-client';

export default function VerifyPage() {
  const [sessionId, setSessionId] = useState('');  const [verificationData, setVerificationData] = useState<{
    verificationLink?: string;
    documentUrl?: string;
    status?: string;
    completedSigners?: number;
    signers?: Array<{
      address: string;
      signature: string;
      timestamp: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify() {
    if (!sessionId.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await web3SigningClient.getVerificationLink(sessionId);
      setVerificationData(data);    } catch (err: unknown) {
      let errorMessage = 'Error al verificar el documento';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            Web3 Document Signing
          </Link>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Firmar
          </Link>
        </div>
      </nav>      <main className="py-8">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verificar Documento
            </h1>
            <p className="text-gray-600">
              Verifica la autenticidad de un documento firmado
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de Sesión
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Ingresa el ID de sesión..."
                className="flex-1 px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleVerify}
                disabled={loading || !sessionId.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-black font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                <span className="text-black">
                  {loading ? 'Verificando...' : 'Verificar'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {verificationData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ Documento Verificado
              </h3>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Estado:</span> {verificationData.status}</p>
                <p><span className="font-medium">Firmantes completados:</span> {verificationData.completedSigners}</p>
                
                {verificationData.verificationLink && (
                  <div className="mt-4">
                    <p className="font-medium text-green-800 mb-2">Enlace de verificación pública:</p>
                    <a 
                      href={verificationData.verificationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {verificationData.verificationLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
