export class UserListItemDto {
  id!: string;
  email!: string;
  firstName!: string | null;
  lastName!: string | null;
  isActive!: boolean;
  roles!: string[];
  lastLoginAt!: Date | null;
  createdAt!: Date;
}

export class ListUsersResponseDto {
  users!: UserListItemDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
