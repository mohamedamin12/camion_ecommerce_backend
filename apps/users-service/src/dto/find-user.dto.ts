import { IsEmail, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export class FindUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @ValidateIf((o) => !o.phone)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Invalid phone number' })
  @ValidateIf((o) => !o.email)
  phone?: string;
}
