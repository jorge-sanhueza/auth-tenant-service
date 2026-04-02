import { randomUUID } from 'crypto';

export class UserId {
  private constructor(private readonly value: string) {}

  static generate(): UserId {
    return new UserId(randomUUID());
  }

  static fromString(id: string): UserId {
    return new UserId(id);
  }

  getValue(): string {
    return this.value;
  }
}
