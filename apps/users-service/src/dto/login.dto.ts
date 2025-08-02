import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @Matches(/^\+?\d+$/, { message: 'Phone must be numeric and optionally start with +' })
  phone: string;

  @IsOptional() 
  @IsString()
  code?: string;
}
