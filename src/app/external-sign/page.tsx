'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SigningCard from '../../components/SigningCard';
import { createWalletFromUserID, createSession, type WalletData, type SessionData } from '../../lib/external-wallet-manager';

interface LoadingState {
  isLoading: boolean;
  message: string;
}

interface ExternalSignData {
  userID: string;
  walletData: WalletData;
  sessionData: SessionData;
  pdfFile: File;
}

const ExternalSignPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    message: 'Inicializando...'
  });
  const [error, setError] = useState<string | null>(null);
  const [signData, setSignData] = useState<ExternalSignData | null>(null);

  useEffect(() => {
    const initializeSignProcess = async () => {
      try {
        setLoadingState({ isLoading: true, message: 'Validando parámetros...' });
        
        // Obtener parámetros de la URL
        const userID = searchParams.get('userID');
        const pdfUrl = searchParams.get('pdfUrl');
        
        if (!userID) {
          throw new Error('El parámetro userID es requerido');
        }
        
        if (!pdfUrl) {
          throw new Error('El parámetro pdfUrl es requerido');
        }

        setLoadingState({ isLoading: true, message: 'Creando wallet...' });
        
        // Crear wallet determinística desde userID
        const walletData = createWalletFromUserID(userID);
        
        setLoadingState({ isLoading: true, message: 'Iniciando sesión...' });
        
        // Crear sesión
        const sessionData = createSession(walletData, userID);
        
        setLoadingState({ isLoading: true, message: 'Descargando documento PDF...' });
        
        // Descargar el PDF usando nuestro proxy para evitar problemas de CORS
        const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Error al descargar PDF: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        const pdfFile = new File([blob], 'documento.pdf', { type: 'application/pdf' });
        
        setLoadingState({ isLoading: true, message: 'Preparando interfaz...' });
        
        // Configurar datos para firma
        setSignData({
          userID,
          walletData,
          sessionData,
          pdfFile
        });
        
        setLoadingState({ isLoading: false, message: '' });
        
      } catch (err) {
        console.error('Error en inicialización:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido durante la inicialización');
        setLoadingState({ isLoading: false, message: '' });
      }
    };

    initializeSignProcess();
  }, [searchParams]);

  if (loadingState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Preparando firma de documento</h2>
            <p className="text-gray-600">{loadingState.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!signData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No se pudieron cargar los datos</h2>
            <p className="text-gray-600">Por favor, verifica los parámetros de la URL</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Firma Digital de Documentos</h1>
          <p className="text-gray-600">Sistema seguro de firma usando tecnología blockchain</p>
        </div>
        
        <SigningCard
          userID={signData.userID}
          walletData={signData.walletData}
          sessionData={signData.sessionData}
          pdfFile={signData.pdfFile}
        />
      </div>
    </div>
  );
};

export default ExternalSignPage;
