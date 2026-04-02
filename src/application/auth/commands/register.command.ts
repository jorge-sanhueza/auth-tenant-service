import { ICommand } from '../../common/interfaces/command.interface';

export class RegisterCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly tenantId: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
  ) {}
}
