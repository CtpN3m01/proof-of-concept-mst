import { ethers } from 'ethers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import type { WalletData } from './external-wallet-manager';
import { Web3SigningContainer } from '../infrastructure/di/web3-signing.container';
import { SigningRequest } from '../domain/model/web3-signing';

export interface SignatureMetadata {
  signer: string;
  signature: string;
  timestamp: string;
  documentHash: string;
  userID: string;
}

export interface SigningResult {
  signedPDF: Blob;
  autopenLink: string;
  signature: string;
  metadata: SignatureMetadata;
  sessionId?: string;
}

/**
 * Firma un PDF con la wallet proporcionada usando la nueva arquitectura
 */
export const signPDF = async (
  pdfFile: File, 
  walletData: WalletData, 
  userID: string
): Promise<SigningResult> => {
  try {
    console.log('=== signPDF ===');
    console.log('File:', { name: pdfFile.name, size: pdfFile.size, type: pdfFile.type });
    console.log('Wallet:', walletData.address);
    console.log('UserID:', userID);

    // Obtener el servicio de firma Web3
    const signingService = Web3SigningContainer.getSigningService();

    // 1. Crear sesión de firma en AutoPen
    const signingRequest: SigningRequest = {
      document: pdfFile,
      signerAddress: walletData.address,
      userID,
      message: `Signing document for user ${userID}`,
    };

    const session = await signingService.createSigningSession(signingRequest);
    console.log('Session created:', session.sessionId);

    // 2. Crear hash del documento para firma
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const documentHash = ethers.keccak256(uint8Array);

    // 3. Crear mensaje para firmar
    const message = `Signing document PDF\nHash: ${documentHash}\nUser: ${userID}\nTimestamp: ${session.timestamp}`;

    // 4. Firmar el mensaje con la wallet
    const signature = await walletData.wallet.signMessage(message);
    console.log('Message signed');

    // 5. Completar firma en AutoPen
    const signingResult = await signingService.signDocument(session.sessionId, signature);
    console.log('AutoPen signing completed:', signingResult);

    // 6. Crear metadata de firma (para compatibilidad)
    const signatureMetadata: SignatureMetadata = {
      signer: walletData.address,
      signature,
      timestamp: session.timestamp,
      documentHash: session.documentHash,
      userID
    };

    // 7. Agregar firma visual al PDF
    const signedPDFBytes = await addSignatureMetadataToPDF(arrayBuffer, signatureMetadata);
    const signedPDFBlob = new Blob([new Uint8Array(signedPDFBytes)], { type: 'application/pdf' });

    return {
      signedPDF: signedPDFBlob,
      autopenLink: signingResult.verificationLink,
      signature,
      metadata: signatureMetadata,
      sessionId: session.sessionId
    };
    
  } catch (error) {
    console.error('Error en signPDF:', error);
    throw new Error(`Error al firmar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Agrega metadata de firma visual al PDF
 */
const addSignatureMetadataToPDF = async (
  pdfArrayBuffer: ArrayBuffer, 
  metadata: SignatureMetadata
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Agregar una nueva página para la información de firma
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  
  // Agregar información de firma en la parte inferior de la primera página
  const signatureText = [
    `Documento firmado digitalmente`,
    `Firmante: ${metadata.signer}`,
    `Fecha: ${new Date(metadata.timestamp).toLocaleString()}`,
    `Usuario: ${metadata.userID}`,
    `Hash: ${metadata.documentHash.substring(0, 20)}...`,
    `Firma: ${metadata.signature.substring(0, 30)}...`
  ];
  
  let yPosition = 100;
  const fontSize = 8;
  const lineHeight = 12;
  
  // Agregar un rectángulo de fondo
  firstPage.drawRectangle({
    x: 20,
    y: yPosition - 10,
    width: width - 40,
    height: signatureText.length * lineHeight + 20,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });
  
  signatureText.forEach((text, index) => {
    firstPage.drawText(text, {
      x: 25,
      y: yPosition + (signatureText.length - index - 1) * lineHeight,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  });
  
  return await pdfDoc.save();
};

/**
 * Descarga el PDF firmado
 */
export const downloadSignedPDF = (signedPDF: Blob, filename: string = 'documento-firmado.pdf') => {
  saveAs(signedPDF, filename);
};
