import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  country?: string;
}