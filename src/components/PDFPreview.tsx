'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importar react-pdf solo en el cliente
const Document = dynamic(
  () => import('react-pdf').then(mod => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import('react-pdf').then(mod => mod.Page),
  { ssr: false }
);

interface PDFPreviewProps {
  file: File;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Configurar PDF worker
    const configurePDF = async () => {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    };
    
    configurePDF();
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-gray-500">Cargando vista previa...</div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-gray-500">Cargando PDF...</div>
      </div>
    );
  }

  return (
    <div className="pdf-preview-container border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="pdf-controls bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {pageNumber} de {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Siguiente
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {file.name}
        </div>
      </div>
      
      <div className="pdf-viewer flex justify-center py-4">
        {Document && Page ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando documento...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error al cargar el PDF</div>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber}
              scale={1.2}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Cargando página...</div>
                </div>
              }
            />
          </Document>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Inicializando visor PDF...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
