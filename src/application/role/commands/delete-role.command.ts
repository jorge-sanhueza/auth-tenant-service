import { ICommand } from '../../common/interfaces/command.interface';

export class DeleteRoleCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
