'use client';

import React, { useState, useEffect } from 'react';

interface SimplePDFPreviewProps {
  file: File;
}

const SimplePDFPreview: React.FC<SimplePDFPreviewProps> = ({ file }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const handleIframeError = () => {
    setIframeError(true);
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
        <div className="text-sm text-gray-600">
          Vista previa del documento
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <button
            onClick={downloadPDF}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Descargar original
          </button>
        </div>
      </div>
      
      <div className="pdf-viewer">
        {!iframeError ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            style={{ border: 'none' }}
            title="Vista previa del PDF"
            onError={handleIframeError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50">
            <div className="text-gray-600 mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 text-center mb-4">
              No se puede mostrar la vista previa del PDF.<br />
              El documento está listo para firmar.
            </p>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Ver PDF original
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePDFPreview;
