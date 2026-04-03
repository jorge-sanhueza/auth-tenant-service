import { ICommand } from '../../common/interfaces/command.interface';

export class CreateRoleCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly tenantId: string,
    public readonly description?: string,
  ) {}
}
