import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IRoleRepository } from '../../../../domain/interfaces/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  private readonly logger = new Logger(PrismaRoleRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  private handleError(operation: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error ${operation}: ${message}`);
    throw error;
  }

  async findById(id: string, tenantId: string): Promise<Role | null> {
    try {
      const role = await this.prisma.role.findFirst({
        where: { id, tenantId },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      if (!role) return null;
      return RoleMapper.toDomain(role);
    } catch (error) {
      this.handleError(`finding role by id ${id}`, error);
    }
  }

  async findByName(name: string, tenantId: string): Promise<Role | null> {
    try {
      const role = await this.prisma.role.findFirst({
        where: { name, tenantId },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      if (!role) return null;
      return RoleMapper.toDomain(role);
    } catch (error) {
      this.handleError(`finding role by name ${name}`, error);
    }
  }

  async findAll(tenantId: string, skip = 0, take = 10): Promise<Role[]> {
    try {
      const roles = await this.prisma.role.findMany({
        where: { tenantId },
        skip,
        take,
        include: {
          permissions: {
            include: { permission: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return roles.map(RoleMapper.toDomain);
    } catch (error) {
      this.handleError('finding all roles', error);
    }
  }

  async save(role: Role): Promise<void> {
    try {
      const data = RoleMapper.toPersistence(role);
      await this.prisma.role.create({
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          isSystem: data.isSystem,
          tenantId: data.tenantId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      });
      this.logger.log(`Role created: ${role.getName()}`);
    } catch (error) {
      this.handleError('saving role', error);
    }
  }

  async update(role: Role): Promise<void> {
    try {
      const data = RoleMapper.toPersistence(role);
      await this.prisma.role.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          updatedAt: data.updatedAt,
        },
      });
      this.logger.log(`Role updated: ${role.getName()}`);
    } catch (error) {
      this.handleError('updating role', error);
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    try {
      await this.prisma.role.deleteMany({
        where: { id, tenantId, isSystem: false },
      });
      this.logger.log(`Role deleted: ${id}`);
    } catch (error) {
      this.handleError('deleting role', error);
    }
  }

  async count(tenantId: string): Promise<number> {
    try {
      return await this.prisma.role.count({ where: { tenantId } });
    } catch (error) {
      this.handleError('counting roles', error);
    }
  }

  async addPermission(roleId: string, permissionId: string): Promise<void> {
    try {
      await this.prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    } catch (error) {
      this.handleError('adding permission to role', error);
    }
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    try {
      await this.prisma.rolePermission.delete({
        where: { roleId_permissionId: { roleId, permissionId } },
      });
    } catch (error) {
      this.handleError('removing permission from role', error);
    }
  }
}
