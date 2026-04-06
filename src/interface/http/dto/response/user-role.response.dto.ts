export class UserRoleResponseDto {
  userId!: string;
  roleId!: string;
  roleName!: string;
  assignedAt!: Date;
}

export class UserRolesResponseDto {
  userId!: string;
  email!: string;
  roles!: {
    id: string;
    name: string;
    description: string | null;
    assignedAt: Date;
  }[];
}
