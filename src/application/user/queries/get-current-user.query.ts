import { IQuery } from 'src/application/common/interfaces/query.interface';

export class GetCurrentUserQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
