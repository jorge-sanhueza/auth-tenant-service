import { ICommand } from '../../common/interfaces/command.interface';

export class LogoutAllCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
