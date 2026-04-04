export class Permission {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string | null,
  ) {}

  static create(name: string, description?: string): Permission {
    // Validate permission name format (e.g., "resource:action")
    if (!/^[a-z]+:[a-z]+$/.test(name)) {
      throw new Error(
        'Permission must be in format "resource:action" (e.g., "user:create")',
      );
    }

    return new Permission(crypto.randomUUID(), name, description || null);
  }

  static reconstitute(data: {
    id: string;
    name: string;
    description: string | null;
  }): Permission {
    return new Permission(data.id, data.name, data.description);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }
}
