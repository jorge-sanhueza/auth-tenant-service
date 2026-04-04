import { randomUUID } from 'crypto';
import { UserId } from '../value-objects/user-id.vo';

export class Session {
  private constructor(
    private readonly id: string,
    private readonly token: string,
    private readonly userId: UserId,
    private readonly expiresAt: Date,
    private readonly createdAt: Date,
  ) {}

  static create(
    userId: string,
    refreshToken: string,
    expiresInDays: number = 7,
  ): Session {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return new Session(
      randomUUID(),
      refreshToken,
      UserId.fromString(userId),
      expiresAt,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
  }): Session {
    return new Session(
      data.id,
      data.token,
      UserId.fromString(data.userId),
      data.expiresAt,
      data.createdAt,
    );
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getToken(): string {
    return this.token;
  }

  getUserId(): string {
    return this.userId.getValue();
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
