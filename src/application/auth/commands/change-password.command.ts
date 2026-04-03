import { ICommand } from '../../common/interfaces/command.interface';

export class ChangePasswordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly oldPassword: string,
    public readonly newPassword: string,
  ) {}
}
