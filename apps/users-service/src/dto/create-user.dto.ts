import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserByAdminDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber('EG') 
  @IsOptional()
  phone?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole; 
}
