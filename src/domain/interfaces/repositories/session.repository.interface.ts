import { Session } from 'src/domain/entities/session.entity';

export interface ISessionRepository {
  create(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
