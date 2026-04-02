export class TenantId {
  private constructor(private readonly value: string) {}

  static create(tenantId: string): TenantId {
    if (!tenantId || tenantId.trim() === '') {
      throw new Error('Tenant ID cannot be empty');
    }
    return new TenantId(tenantId);
  }

  getValue(): string {
    return this.value;
  }
}
