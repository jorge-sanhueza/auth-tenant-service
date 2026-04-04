import { User } from '../../entities/user.entity';

export interface IUserRepository {
  findById(id: string, tenantId: string): Promise<User | null>;
  findByEmail(email: string, tenantId: string): Promise<User | null>;
  findByEmailWithRoles(email: string, tenantId: string): Promise<User | null>;
  findAll(tenantId: string, skip?: number, take?: number): Promise<User[]>;
  findActiveUsers(
    tenantId: string,
    skip?: number,
    take?: number,
  ): Promise<User[]>;
  findUsersByRole(tenantId: string, roleName: string): Promise<User[]>;
  assignRole(userId: string, roleId: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  updateLastLogin(id: string, tenantId: string): Promise<void>;
}
