import { IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsUUID()
  affiliateId: string;

  @Min(0.1)
  @Max(5)
  discountPercentage: number;
}
