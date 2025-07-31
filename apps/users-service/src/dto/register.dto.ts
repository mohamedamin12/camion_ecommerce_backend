import { IsEmail, IsNotEmpty, IsPhoneNumber, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  @Matches(/^\+?\d+$/, { message: 'Phone must be numeric and optionally start with +' })
  phone: string;

  @IsNotEmpty()
  fullName: string;

}
