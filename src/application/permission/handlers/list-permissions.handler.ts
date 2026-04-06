import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPermissionsQuery } from '../queries/list-permissions.query';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';

export interface PermissionDto {
  id: string;
  name: string;
  description: string | null;
}

export interface ListPermissionsResult {
  permissions: PermissionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler implements IQueryHandler<
  ListPermissionsQuery,
  ListPermissionsResult
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListPermissionsQuery): Promise<ListPermissionsResult> {
    const skip = (query.page - 1) * query.limit;

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        skip,
        take: query.limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
        },
      }),
      this.prisma.permission.count(),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      permissions,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }
}
