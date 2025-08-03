import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAffiliateRequestDto } from 'apps/affiliate-service/src/dto/create-affiliate-request.dto';
import { CreateCouponDto } from 'apps/affiliate-service/src/dto/create-coupon.dto';
import { ReviewAffiliateRequestDto } from 'apps/affiliate-service/src/dto/review-affiliate-request.dto ';
import { SearchCouponsDto } from 'apps/affiliate-service/src/dto/search-coupons.dto';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { JwtAuthGuard } from 'libs/auth/src';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('affiliates')
export class AffiliateController {
  constructor(
    @Inject('AFFILIATE_SERVICE') private readonly affiliateClient: ClientProxy,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Post('request')
   requestAffiliate(@Body() dto: CreateAffiliateRequestDto) {
    return this.affiliateClient.send({ cmd: 'create_affiliate_request' }, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('requests/pending')
   getPendingRequests() {
    return this.affiliateClient.send({ cmd: 'get_pending_affiliate_requests' }, {});
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('requests/review')
   reviewRequest(@Body() dto: ReviewAffiliateRequestDto) {
    return this.affiliateClient.send({ cmd: 'review_affiliate_request' }, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AFFILIATE)
  @Post('coupon')
   createCoupon(@Body() dto: CreateCouponDto) {
    return this.affiliateClient.send({ cmd: 'create_coupon' }, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('coupon/:affiliateId')
   getCoupons(@Param('affiliateId') affiliateId: string) {
    return this.affiliateClient.send({ cmd: 'get_coupons_by_affiliate' }, affiliateId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('coupon/search')
  searchCoupons(@Body() dto: SearchCouponsDto) {
    return this.affiliateClient.send({ cmd: 'search_coupons' }, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('coupon/:id')
   deleteCoupon(@Param('id') couponId: string) {
    return this.affiliateClient.send({ cmd: 'delete_coupon' }, couponId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AFFILIATE)
  @Patch(':id')
   updateAffiliate(@Param('id') id: string, @Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'update_affiliate' }, { id, ...dto });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AFFILIATE)
  @Delete(':id')
   deleteAffiliate(@Param('id') id: string) {
    return this.affiliateClient.send({ cmd: 'delete_affiliate' }, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('coupons/all')
   getAllCoupons() {
    return this.affiliateClient.send({ cmd: 'get_all_coupons' }, {});
  }
}
