import { ethers } from 'ethers';

// Tipos para EIP-712
interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: string;
  salt?: string;
}

interface EIP712Types {
  [key: string]: Array<{
    name: string;
    type: string;
  }>;
}

interface EIP712Message {
  [key: string]: unknown;
}

export interface UserWallet {
  address: string;
  privateKey: string;
  wallet: ethers.Wallet;
}

/**
 * Genera una wallet determinística basada en un UserID
 * Usa el UserID como semilla para generar siempre la misma wallet para el mismo usuario
 */
export function generateWalletForUser(userId: string): UserWallet {
  // Crear un hash determinístico del UserID para usar como semilla
  const seed = ethers.keccak256(ethers.toUtf8Bytes(`user_wallet_${userId}`));
  
  // Crear la wallet usando la semilla
  const wallet = new ethers.Wallet(seed);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    wallet
  };
}

/**
 * Simula un sistema de autenticación simple basado en UserID
 */
export class UserWalletManager {
  private currentUser: { userId: string; wallet: UserWallet } | null = null;

  /**
   * "Login" del usuario - genera/recupera la wallet asociada al UserID
   */
  loginWithUserId(userId: string): UserWallet {
    if (!userId || userId.trim() === '') {
      throw new Error('UserID no puede estar vacío');
    }

    const wallet = generateWalletForUser(userId.trim());
    this.currentUser = { userId: userId.trim(), wallet };
    
    console.log(`🔐 Usuario logeado - UserID: ${userId}, Wallet: ${wallet.address}`);
    
    return wallet;
  }

  /**
   * Obtiene la wallet del usuario actual
   */
  getCurrentWallet(): UserWallet | null {
    return this.currentUser?.wallet || null;
  }

  /**
   * Obtiene el UserID actual
   */
  getCurrentUserId(): string | null {
    return this.currentUser?.userId || null;
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this.currentUser = null;
    console.log('👋 Usuario deslogeado');
  }

  /**
   * Verifica si hay un usuario logeado
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }  /**
   * Firma un mensaje tipado EIP-712
   */
  async signTypedData(
    domain: EIP712Domain,
    types: EIP712Types,
    value: EIP712Message
  ): Promise<string> {
    if (!this.currentUser) {
      throw new Error('No hay usuario logeado');
    }
    
    const signature = await this.currentUser.wallet.wallet.signTypedData(domain, types, value);
    return signature;
  }
}

// Instancia global del wallet manager
export const walletManager = new UserWalletManager();
