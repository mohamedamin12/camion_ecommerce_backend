import { IsEnum, IsUUID } from "class-validator";
import { AffiliateStatus } from "../entities/affiliate.entity";

export class ReviewAffiliateRequestDto {
  @IsUUID()
  affiliateId: string;

  @IsEnum(AffiliateStatus)
  status: AffiliateStatus;
}
