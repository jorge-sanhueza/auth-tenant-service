import { ICommand } from '../../common/interfaces/command.interface';

export class RemoveRoleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly tenantId: string,
  ) {}
}
