import * as bcrypt from 'bcryptjs';

export class Password {
  private constructor(private readonly hash: string) {}

  static create(password: string): Password {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  compare(plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, this.hash);
  }

  getHash(): string {
    return this.hash;
  }
}
