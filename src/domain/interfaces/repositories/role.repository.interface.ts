import { Role } from '../../entities/role.entity';

export interface IRoleRepository {
  findById(id: string, tenantId: string): Promise<Role | null>;
  findByName(name: string, tenantId: string): Promise<Role | null>;
  findAll(tenantId: string, skip?: number, take?: number): Promise<Role[]>;
  save(role: Role): Promise<void>;
  update(role: Role): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  addPermission(roleId: string, permissionId: string): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
}
