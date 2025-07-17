import { ethers } from 'ethers';

export interface WalletData {
  address: string;
  privateKey: string;
  wallet: ethers.Wallet;
}

export interface SessionData {
  id: string;
  address: string;
  timestamp: number;
  userID: string;
}

/**
 * Crea una wallet determinística basada en el userID
 */
export const createWalletFromUserID = (userID: string): WalletData => {
  // Crear un hash determinístico del userID
  const seed = ethers.keccak256(ethers.toUtf8Bytes(userID + "mst-signature-salt"));
  const wallet = new ethers.Wallet(seed);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    wallet
  };
};

/**
 * Crea una nueva sesión para la wallet
 */
export const createSession = (walletData: WalletData, userID: string): SessionData => {
  const timestamp = Date.now();
  const sessionData: SessionData = {
    id: `session_${timestamp}_${userID}`,
    address: walletData.address,
    timestamp,
    userID
  };
  
  // Guardar en localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentSession', JSON.stringify(sessionData));
  }
  
  return sessionData;
};

/**
 * Obtiene la sesión actual del localStorage
 */
export const getCurrentSession = (): SessionData | null => {
  if (typeof window === 'undefined') return null;
  
  const sessionStr = localStorage.getItem('currentSession');
  if (!sessionStr) return null;
  
  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
};
