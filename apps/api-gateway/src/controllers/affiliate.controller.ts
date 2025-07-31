import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { JwtAuthGuard } from 'libs/auth/src';
import { Roles } from 'libs/auth/src/roles.decorator';
import { RolesGuard } from 'libs/auth/src/roles.guard';

@Controller('affiliates')
export class AffiliateController {
  constructor(
    @Inject('AFFILIATE_SERVICE') private readonly affiliateClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Post('request')
  async requestAffiliate(@Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'create_affiliate_request' }, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('requests/pending')
  async getPendingRequests() {
    return this.affiliateClient.send({ cmd: 'get_pending_affiliate_requests' }, {});
  }

  @Post('requests/review')
  async reviewRequest(@Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'review_affiliate_request' }, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN || UserRole.AFFILIATE )
  @Post('coupon')
  async createCoupon(@Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'create_coupon' }, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('coupon/:affiliateId')
  async getCoupons(@Param('affiliateId') affiliateId: string) {
    return this.affiliateClient.send({ cmd: 'get_coupons_by_affiliate' }, affiliateId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('coupon/:id')
  async deleteCoupon(@Param('id') couponId: string) {
    return this.affiliateClient.send({ cmd: 'delete_coupon' }, couponId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AFFILIATE )
  @Patch(':id')
  async updateAffiliate(@Param('id') id: string, @Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'update_affiliate' }, { id, ...dto });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN || UserRole.AFFILIATE )
  @Delete(':id')
  async deleteAffiliate(@Param('id') id: string) {
    return this.affiliateClient.send({ cmd: 'delete_affiliate' }, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('coupons/all')
  async getAllCoupons() {
    return this.affiliateClient.send({ cmd: 'get_all_coupons' }, {});
  }
}
