import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('affiliates')
export class AffiliateController {
  constructor(
    @Inject('AFFILIATE_SERVICE') private readonly affiliateClient: ClientProxy,
  ) {}

  @Post('request')
  async requestAffiliate(@Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'create_affiliate_request' }, dto);
  }

  @Get('requests/pending')
  async getPendingRequests() {
    return this.affiliateClient.send({ cmd: 'get_pending_affiliate_requests' }, {});
  }

  @Post('requests/review')
  async reviewRequest(@Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'review_affiliate_request' }, dto);
  }

  @Post('coupon')
  async createCoupon(@Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'create_coupon' }, dto);
  }

  @Get('coupon/:affiliateId')
  async getCoupons(@Param('affiliateId') affiliateId: string) {
    return this.affiliateClient.send({ cmd: 'get_coupons_by_affiliate' }, affiliateId);
  }

  @Delete('coupon/:id')
  async deleteCoupon(@Param('id') couponId: string) {
    return this.affiliateClient.send({ cmd: 'delete_coupon' }, couponId);
  }

  @Patch(':id')
  async updateAffiliate(@Param('id') id: string, @Body() dto: any) {
    return this.affiliateClient.send({ cmd: 'update_affiliate' }, { id, ...dto });
  }

  @Delete(':id')
  async deleteAffiliate(@Param('id') id: string) {
    return this.affiliateClient.send({ cmd: 'delete_affiliate' }, id);
  }

  @Get('coupons/all')
  async getAllCoupons() {
    return this.affiliateClient.send({ cmd: 'get_all_coupons' }, {});
  }
}
