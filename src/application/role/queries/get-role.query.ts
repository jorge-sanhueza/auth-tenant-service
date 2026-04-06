import { IQuery } from '../../common/interfaces/query.interface';

export class GetRoleQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
