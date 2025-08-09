import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^\+?\d+$/, { message: 'Phone must be numeric and optionally start with +' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  code: string;
}
