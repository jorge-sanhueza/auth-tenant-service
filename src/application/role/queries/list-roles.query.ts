import { IQuery } from '../../common/interfaces/query.interface';

export class ListRolesQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
