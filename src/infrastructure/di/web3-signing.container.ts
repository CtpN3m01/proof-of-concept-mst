import { Web3SigningService, Web3SigningServiceImpl } from '../../domain/services/web3-signing.service';
import { AutopenRepository, AutopenRepositoryImpl } from '../repositories/autopen.repository';
import { SigningSessionRepository, InMemorySigningSessionRepository } from '../repositories/signing-session.repository';

// Dependency Injection Container
export class Web3SigningContainer {
  private static _signingService: Web3SigningService;
  private static _autopenRepository: AutopenRepository;
  private static _sessionRepository: SigningSessionRepository;

  static getSigningService(): Web3SigningService {
    if (!this._signingService) {
      console.log('=== Web3SigningContainer.getSigningService ===');
      console.log('Initializing Web3SigningService...');
      
      const autopenRepo = this.getAutopenRepository();
      const sessionRepo = this.getSessionRepository();
      this._signingService = new Web3SigningServiceImpl(autopenRepo, sessionRepo);
      
      console.log('Web3SigningService initialized successfully');
    }
    return this._signingService;
  }

  static getAutopenRepository(): AutopenRepository {
    if (!this._autopenRepository) {
      console.log('=== Web3SigningContainer.getAutopenRepository ===');
      console.log('Initializing AutopenRepository...');
      this._autopenRepository = new AutopenRepositoryImpl();
      console.log('AutopenRepository initialized successfully');
    }
    return this._autopenRepository;
  }

  static getSessionRepository(): SigningSessionRepository {
    if (!this._sessionRepository) {
      console.log('=== Web3SigningContainer.getSessionRepository ===');
      console.log('Initializing InMemorySigningSessionRepository...');
      this._sessionRepository = new InMemorySigningSessionRepository();
      console.log('SigningSessionRepository initialized successfully');
    }
    return this._sessionRepository;
  }

  // Para testing o cuando quieras resetear el container
  static reset(): void {
    console.log('=== Web3SigningContainer.reset ===');
    this._signingService = undefined as any;
    this._autopenRepository = undefined as any;
    this._sessionRepository = undefined as any;
    console.log('Container reset successfully');
  }
}
