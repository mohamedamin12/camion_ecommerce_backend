import { IsOptional, IsString } from 'class-validator';

export class SearchCouponsDto {
  @IsOptional()
  @IsString()
  code?: string;
}
