import type { Prisma } from 'generated/prisma/client';
import { Session } from '../../../../domain/entities/session.entity';

type PrismaSession = Prisma.SessionGetPayload<Record<string, never>>;

export class SessionMapper {
  static toDomain(prismaSession: PrismaSession): Session {
    return Session.reconstitute({
      id: prismaSession.id,
      token: prismaSession.token,
      userId: prismaSession.userId,
      expiresAt: prismaSession.expiresAt,
      createdAt: prismaSession.createdAt,
    });
  }

  static toPersistence(session: Session): {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
  } {
    return {
      id: session.getId(),
      token: session.getToken(),
      userId: session.getUserId(),
      expiresAt: session.getExpiresAt(),
      createdAt: session.getCreatedAt(),
    };
  }
}
