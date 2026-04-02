export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundException';
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsException';
  }
}

export class UserDeactivatedException extends DomainException {
  constructor() {
    super('User is deactivated');
    this.name = 'UserDeactivatedException';
  }
}

export class TenantNotFoundException extends DomainException {
  constructor() {
    super('Tenant not found');
    this.name = 'TenantNotFoundException';
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsException';
  }
}
