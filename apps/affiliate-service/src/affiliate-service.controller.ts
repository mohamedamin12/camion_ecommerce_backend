import { Controller, Get } from '@nestjs/common';
import { AffiliateServiceService } from './affiliate-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateAffiliateRequestDto } from './dto/create-affiliate-request.dto';
import { ReviewAffiliateRequestDto } from './dto/review-affiliate-request.dto ';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';

@Controller()
export class AffiliateServiceController {
  constructor(private readonly affiliateService: AffiliateServiceService) { }

  @MessagePattern({ cmd: 'affiliate_request' })
  handleAffiliateRequest(@Payload() dto: CreateAffiliateRequestDto) {
    return this.affiliateService.createAffiliateRequest(dto);
  }

  @MessagePattern({ cmd: 'get_pending_affiliate_requests' })
  handleGetPendingRequests() {
    return this.affiliateService.getPendingRequests();
  }

  @MessagePattern({ cmd: 'review_affiliate_request' })
  handleReviewRequest(@Payload() dto: ReviewAffiliateRequestDto) {
    return this.affiliateService.reviewAffiliateRequest(dto);
  }

  @MessagePattern({ cmd: 'create_coupon' })
  handleCreateCoupon(@Payload() dto: CreateCouponDto) {
    return this.affiliateService.createCoupon(dto);
  }

  @MessagePattern({ cmd: 'update_affiliate' })
  handleUpdateAffiliate(@Payload() dto: UpdateAffiliateDto) {
    return this.affiliateService.updateAffiliate(dto);
  }

  @MessagePattern({ cmd: 'delete_affiliate' })
  handleDeleteAffiliate(@Payload() id: string) {
    return this.affiliateService.deleteAffiliate(id);
  }

  @MessagePattern({ cmd: 'get_coupons_by_affiliate' })
  handleGetCouponsByAffiliate(@Payload() affiliateId: string) {
    return this.affiliateService.getCouponsByAffiliate(affiliateId);
  }

  @MessagePattern({ cmd: 'get_all_coupons' })
  handleGetAllCoupons() {
    return this.affiliateService.getAllCoupons();
  }


}
