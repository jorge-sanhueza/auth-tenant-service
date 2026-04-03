import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateRoleRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message:
      'Role name must start with a letter and contain only lowercase letters, numbers, and underscores',
  })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
