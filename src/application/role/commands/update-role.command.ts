import { ICommand } from '../../common/interfaces/command.interface';

export class UpdateRoleCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name?: string,
    public readonly description?: string,
  ) {}
}
