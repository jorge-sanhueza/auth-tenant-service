export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email.toLowerCase());
  }

  getValue(): string {
    return this.value;
  }
}
