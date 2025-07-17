'use client';

import { useEffect } from 'react';

export default function PDFConfig() {
  useEffect(() => {
    // Configurar worker para react-pdf solo en el cliente
    const configurePDF = async () => {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    };
    
    configurePDF();
  }, []);

  return null;
}
