import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ISessionRepository } from '../../../../domain/interfaces/repositories/session.repository.interface';
import { Session } from '../../../../domain/entities/session.entity';
import { SessionMapper } from '../mappers/session.mapper';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  private readonly logger = new Logger(PrismaSessionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  private handleError(operation: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error ${operation}: ${message}`);
    throw error;
  }

  async create(session: Session): Promise<void> {
    try {
      const data = SessionMapper.toPersistence(session);
      await this.prisma.session.create({ data });
      this.logger.log(`Session created for user: ${session.getUserId()}`);
    } catch (error) {
      this.handleError('creating session', error);
    }
  }

  async findByToken(token: string): Promise<Session | null> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { token },
      });

      if (!session) return null;
      return SessionMapper.toDomain(session);
    } catch (error) {
      this.handleError('finding session by token', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.session.delete({ where: { id } });
      this.logger.log(`Session deleted: ${id}`);
    } catch (error) {
      this.handleError('deleting session', error);
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.prisma.session.deleteMany({ where: { userId } });
      this.logger.log(`All sessions deleted for user: ${userId}`);
    } catch (error) {
      this.handleError('deleting sessions by user id', error);
    }
  }

  async deleteExpired(): Promise<number> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      this.logger.log(`Deleted ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      this.handleError('deleting expired sessions', error);
    }
  }
}
