/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AffiliateServiceService } from './affiliate-service.service';
import { CreateAffiliateRequestDto } from './dto/create-affiliate-request.dto';
import { ReviewAffiliateRequestDto } from './dto/review-affiliate-request.dto ';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { SearchCouponsDto } from './dto/search-coupons.dto';

function mapException(error: any) {
  if (
    error instanceof NotFoundException ||
    error instanceof ConflictException ||
    error instanceof BadRequestException ||
    error instanceof UnauthorizedException
  ) {
    return new RpcException({
      statusCode: error.getStatus(),
      message: error.message,
    });
  }
  return new RpcException({
    statusCode: 500,
    message: error?.message || 'Unknown error from affiliate microservice',
  });
}

@UsePipes(new ValidationPipe({
  exceptionFactory: (errors) =>
    new RpcException({
      statusCode: 400,
      message: 'Validation failed',
      details: errors,
    }),
}))
@Controller()
export class AffiliateServiceController {
  constructor(private readonly affiliateService: AffiliateServiceService) { }

  @MessagePattern({ cmd: 'create_affiliate_request' })
  async handleAffiliateRequest(@Payload() dto: CreateAffiliateRequestDto) {
    try {
      return await this.affiliateService.createAffiliateRequest(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_pending_affiliate_requests' })
  async handleGetPendingRequests() {
    try {
      return await this.affiliateService.getPendingRequests();
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'affiliate.getCouponByCode' })
  async getCouponByCode(@Payload() { code }: { code: string }) {
    try {
      return await this.affiliateService.getCouponByCode(code);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'review_affiliate_request' })
  async handleReviewRequest(@Payload() dto: ReviewAffiliateRequestDto) {
    try {
      return await this.affiliateService.reviewAffiliateRequest(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'create_coupon' })
  async handleCreateCoupon(@Payload() dto: CreateCouponDto) {
    try {
      return await this.affiliateService.createCoupon(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'search_coupons' })
  async searchCoupons(@Payload() dto: SearchCouponsDto) {
    try {
      return await this.affiliateService.searchCoupons(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'delete_coupon' })
  async deleteCoupon(@Payload() id: string) {
    try {
      return await this.affiliateService.deleteCoupon(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'update_affiliate' })
  async handleUpdateAffiliate(@Payload() dto: UpdateAffiliateDto) {
    try {
      return await this.affiliateService.updateAffiliate(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'delete_affiliate' })
  async handleDeleteAffiliate(@Payload() id: string) {
    try {
      return await this.affiliateService.deleteAffiliate(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_coupons_by_affiliate' })
  async handleGetCouponsByAffiliate(@Payload() affiliateId: string) {
    try {
      return await this.affiliateService.getCouponsByAffiliate(affiliateId);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_all_coupons' })
  async handleGetAllCoupons() {
    try {
      return await this.affiliateService.getAllCoupons();
    } catch (error) {
      throw mapException(error);
    }
  }
}
