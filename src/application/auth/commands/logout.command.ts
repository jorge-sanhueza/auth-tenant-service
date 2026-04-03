import { ICommand } from '../../common/interfaces/command.interface';

export class LogoutCommand implements ICommand {
  constructor(
    public readonly refreshToken: string,
    public readonly tenantId: string,
  ) {}
}
