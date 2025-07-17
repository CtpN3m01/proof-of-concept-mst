import { SigningSession } from '../../domain/model/web3-signing';

export interface SigningSessionRepository {
  save(session: SigningSession): Promise<void>;
  findById(sessionId: string): Promise<SigningSession | null>;
  findByUserID(userID: string): Promise<SigningSession[]>;
  update(session: SigningSession): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

// Implementación en memoria (puedes cambiar a DB más tarde)
export class InMemorySigningSessionRepository implements SigningSessionRepository {
  private sessions = new Map<string, SigningSession>();

  async save(session: SigningSession): Promise<void> {
    console.log('=== InMemorySigningSessionRepository.save ===');
    console.log('Saving session:', session.sessionId);
    this.sessions.set(session.sessionId, { ...session });
  }

  async findById(sessionId: string): Promise<SigningSession | null> {
    console.log('=== InMemorySigningSessionRepository.findById ===');
    console.log('Looking for session:', sessionId);
    const session = this.sessions.get(sessionId) || null;
    console.log('Found session:', !!session);
    return session;
  }

  async findByUserID(userID: string): Promise<SigningSession[]> {
    console.log('=== InMemorySigningSessionRepository.findByUserID ===');
    console.log('Looking for sessions for user:', userID);
    const sessions = Array.from(this.sessions.values())
      .filter(session => session.userID === userID);
    console.log('Found sessions:', sessions.length);
    return sessions;
  }

  async update(session: SigningSession): Promise<void> {
    console.log('=== InMemorySigningSessionRepository.update ===');
    console.log('Updating session:', session.sessionId);
    if (this.sessions.has(session.sessionId)) {
      this.sessions.set(session.sessionId, { ...session });
      console.log('Session updated successfully');
    } else {
      console.log('Session not found for update');
    }
  }

  async delete(sessionId: string): Promise<void> {
    console.log('=== InMemorySigningSessionRepository.delete ===');
    console.log('Deleting session:', sessionId);
    const deleted = this.sessions.delete(sessionId);
    console.log('Session deleted:', deleted);
  }
}
