import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePermissionDto {
  @IsString()
  action: string; // now it can accept multiple actions

  @IsString()
  resource: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  roles: number[];
}
