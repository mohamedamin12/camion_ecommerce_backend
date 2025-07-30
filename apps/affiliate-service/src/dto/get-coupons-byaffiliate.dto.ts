import { IsUUID } from "class-validator";

export class GetCouponsByAffiliateDto {
  @IsUUID()
  affiliateId: string;
}
