import { IsEmail, IsNotEmpty, IsPhoneNumber, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^\+?\d+$/, {
    message: 'Phone must be numeric and optionally start with +',
  })
  phone: string;
}
