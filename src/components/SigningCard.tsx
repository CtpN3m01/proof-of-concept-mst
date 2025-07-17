'use client';

import React, { useState } from 'react';
import SimplePDFPreview from './SimplePDFPreview';
import { signPDF, downloadSignedPDF, type SigningResult } from '../lib/pdf-signing';
import type { WalletData, SessionData } from '../lib/external-wallet-manager';

interface SigningCardProps {
  userID: string;
  walletData: WalletData;
  sessionData: SessionData;
  pdfFile: File;
}

const SigningCard: React.FC<SigningCardProps> = ({
  userID,
  walletData,
  sessionData,
  pdfFile
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const [signingResult, setSigningResult] = useState<SigningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    setIsSigning(true);
    setError(null);
    
    try {
      const result = await signPDF(pdfFile, walletData, userID);
      setSigningResult(result);
    } catch (err) {
      console.error('Error al firmar:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al firmar el documento');
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = () => {
    if (signingResult) {
      downloadSignedPDF(signingResult.signedPDF, `documento-firmado-${userID}-${Date.now()}.pdf`);
    }
  };

  const handleOpenAutopen = () => {
    if (signingResult) {
      window.open(signingResult.autopenLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Firma de Documento Digital</h2>
          <p className="text-blue-100 mt-1">Firma tu documento de forma segura con blockchain</p>
        </div>

        <div className="p-6">
          {/* Información del usuario y wallet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Usuario</h3>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-600">Usuario ID:</span>
                  <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {userID}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-600">Sesión:</span>
                  <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {sessionData.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Wallet Information</h3>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-600">Dirección:</span>
                  <span className="text-xs font-mono bg-white px-2 py-1 rounded border break-all">
                    {walletData.address}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Wallet conectada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa del PDF */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Documento a Firmar</h3>
            <SimplePDFPreview file={pdfFile} />
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-red-800">Error al firmar documento</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="border-t border-gray-200 pt-6">
            {!signingResult ? (
              <div className="text-center">
                <button
                  onClick={handleSign}
                  disabled={isSigning}
                  className={`
                    inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white
                    ${isSigning 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }
                    transition-colors duration-200
                  `}
                >
                  {isSigning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Firmando y creando sesión en Autopen...
                    </>
                  ) : (
                    'Firmar Documento'
                  )}
                </button>
                <p className="text-gray-500 text-sm mt-2">
                  Al hacer clic, se generará una firma digital y se creará una sesión en Autopen para verificación
                </p>
              </div>
            ) : (
              <div className="text-center">
                {/* Mensaje de éxito */}
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <div className="text-green-400 mr-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800">¡Documento firmado exitosamente!</h4>
                      <p className="text-green-700 text-sm mt-1">
                        El documento ha sido firmado digitalmente y registrado en Autopen para verificación
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de la firma */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-gray-800 mb-3">Detalles de la Firma</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Tiempo de firma:</span>
                      <div className="text-gray-800 mt-1">
                        {new Date(signingResult.metadata.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Hash del documento:</span>
                      <div className="font-mono text-gray-800 mt-1 break-all text-xs">
                        {signingResult.metadata.documentHash}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Descargar PDF Firmado
                  </button>
                  
                  <button
                    onClick={handleOpenAutopen}
                    className="inline-flex items-center px-6 py-3 border border-blue-300 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    Verificar en Autopen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigningCard;
