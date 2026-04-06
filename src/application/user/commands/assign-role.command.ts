import { ICommand } from '../../common/interfaces/command.interface';

export class AssignRoleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly tenantId: string,
  ) {}
}
