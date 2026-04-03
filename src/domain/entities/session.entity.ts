import { randomUUID } from 'crypto';

export class Session {
  private constructor(
    private readonly id: string,
    private readonly token: string,
    private readonly userId: string,
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
      userId,
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
      data.userId,
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
    return this.userId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
