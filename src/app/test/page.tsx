'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const TestPage: React.FC = () => {
  const [userID, setUserID] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const generateUrl = () => {
    if (!userID || !pdfUrl) {
      alert('Por favor completa ambos campos');
      return;
    }

    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
      return;
    }

    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      userID: userID.trim(),
      pdfUrl: pdfUrl.trim()
    });
    
    const url = `${baseUrl}/external-sign?${params.toString()}`;
    setGeneratedUrl(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      alert('URL copiada al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar la URL');
    }
  };

  // URLs de ejemplo para PDFs de prueba
  const examplePdfs = [
    {
      name: 'PDF de muestra 1',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      name: 'PDF de muestra 2', 
      url: 'https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generador de URLs para Firma Externa</h1>
          <p className="text-gray-600 mb-8">
            Utiliza esta herramienta para generar URLs que permitan la firma de documentos desde sitios externos.
          </p>

          <div className="space-y-6">
            {/* Campo User ID */}
            <div>
              <label htmlFor="userID" className="block text-sm font-medium text-gray-700 mb-2">
                User ID *
              </label>
              <input
                type="text"
                id="userID"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                placeholder="Ej: user123, juan.perez, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Identificador único del usuario. Se usará para generar la wallet de forma determinística.
              </p>
            </div>

            {/* Campo PDF URL */}
            <div>
              <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL del PDF *
              </label>
              <input
                type="url"
                id="pdfUrl"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://ejemplo.com/documento.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL directa al archivo PDF que se desea firmar. Debe ser accesible públicamente.
              </p>
            </div>

            {/* PDFs de ejemplo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDFs de ejemplo (haz clic para usar)
              </label>
              <div className="space-y-2">
                {examplePdfs.map((pdf, index) => (
                  <button
                    key={index}
                    onClick={() => setPdfUrl(pdf.url)}
                    className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border text-blue-600 hover:text-blue-800"
                  >
                    {pdf.name}: {pdf.url}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón generar */}
            <button
              onClick={generateUrl}
              disabled={!userID || !pdfUrl}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                userID && pdfUrl
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } transition-colors duration-200`}
            >
              Generar URL de Firma
            </button>

            {/* URL generada */}
            {generatedUrl && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">URL Generada:</h3>
                <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                  {generatedUrl}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors duration-200"
                  >
                    Copiar URL
                  </button>
                  <Link
                    href={generatedUrl}
                    target="_blank"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium text-center transition-colors duration-200"
                  >
                    Probar URL
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">¿Cómo funciona?</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Se genera una wallet determinística basada en el User ID</li>
              <li>Se descarga el PDF desde la URL proporcionada</li>
              <li>Se crea una sesión temporal para el proceso de firma</li>
              <li>El usuario puede firmar el documento con un solo clic</li>
              <li>Se puede verificar la firma en Etherscan</li>
            </ul>
          </div>

          {/* Ejemplo de integración */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ejemplo de integración:</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`// JavaScript
const userID = "usuario123";
const pdfUrl = "https://mi-sitio.com/documento.pdf";
const signUrl = \`\${window.location.origin}/external-sign?userID=\${userID}&pdfUrl=\${encodeURIComponent(pdfUrl)}\`;

// Redirigir al usuario
window.location.href = signUrl;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
