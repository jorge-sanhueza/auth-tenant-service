import { ICommand } from '../../common/interfaces/command.interface';

export class LoginCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly tenantId: string,
  ) {}
}
