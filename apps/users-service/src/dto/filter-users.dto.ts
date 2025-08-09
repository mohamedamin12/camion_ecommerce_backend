import { IsOptional, IsEnum, IsBoolean, IsDateString, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class FilterUsersDto {
  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  joinedAfter?: string;

  @IsOptional()
  @IsDateString()
  joinedBefore?: string;
}
