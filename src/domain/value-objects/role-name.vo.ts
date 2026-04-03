export class RoleName {
  private constructor(private readonly value: string) {}

  static create(name: string): RoleName {
    if (!name || name.trim().length === 0) {
      throw new Error('Role name cannot be empty');
    }
    if (name.length < 2) {
      throw new Error('Role name must be at least 2 characters');
    }
    if (name.length > 50) {
      throw new Error('Role name must be less than 50 characters');
    }
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      throw new Error(
        'Role name must start with a letter and contain only lowercase letters, numbers, and underscores',
      );
    }
    return new RoleName(name.toLowerCase());
  }

  getValue(): string {
    return this.value;
  }
}
