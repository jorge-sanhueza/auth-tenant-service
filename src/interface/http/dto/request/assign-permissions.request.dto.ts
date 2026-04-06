import { IsArray, IsString } from 'class-validator';

export class AssignPermissionsRequestDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds!: string[];
}
