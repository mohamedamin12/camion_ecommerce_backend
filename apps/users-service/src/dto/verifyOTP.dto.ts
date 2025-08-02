import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @Matches(/^\+?\d+$/, {
    message: 'Phone must be numeric and optionally start with +',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
