import { IQuery } from '../../common/interfaces/query.interface';

export class ListUsersQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly isActive?: boolean,
  ) {}
}
