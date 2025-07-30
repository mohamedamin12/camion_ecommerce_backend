import { IsOptional, IsString } from 'class-validator';

export class UpdateAffiliateDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  referralLink?: string;
}
