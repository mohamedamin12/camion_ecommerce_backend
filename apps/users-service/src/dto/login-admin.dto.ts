import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginAdminDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  password: string;
}
