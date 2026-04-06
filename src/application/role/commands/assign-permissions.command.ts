import { ICommand } from '../../common/interfaces/command.interface';

export class AssignPermissionsCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly tenantId: string,
    public readonly permissionIds: string[],
  ) {}
}
