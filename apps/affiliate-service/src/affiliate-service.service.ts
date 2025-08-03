import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAffiliateRequestDto } from './dto/create-affiliate-request.dto';
import { Affiliate, AffiliateStatus } from './entities/affiliate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewAffiliateRequestDto } from './dto/review-affiliate-request.dto ';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { SearchCouponsDto } from './dto/search-coupons.dto';

@Injectable()
export class AffiliateServiceService {
  constructor(
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) { }

  async createAffiliateRequest(dto: CreateAffiliateRequestDto) {
    const existing = await this.affiliateRepository.findOne({ where: { userId: dto.userId } });
    if (existing) {
      throw new ConflictException('You already submitted a request or you are an affiliate');
    }
  
    const affiliate = this.affiliateRepository.create({
      userId: dto.userId,
      fullName: dto.fullName,
      gender: dto.gender,
      nationality: dto.nationality,
      bio: dto.bio,
      status: AffiliateStatus.PENDING,
      totalEarnings: 0,
      couponsCreated: 0,
    });
  
    return this.affiliateRepository.save(affiliate);
  }  

  async getPendingRequests() {
    return this.affiliateRepository.find({ where: { status: AffiliateStatus.PENDING } });
  }

  async reviewAffiliateRequest(dto: ReviewAffiliateRequestDto) {
    const affiliate = await this.affiliateRepository.findOne({ where: { id: dto.affiliateId } });
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    affiliate.status = dto.status;
    return this.affiliateRepository.save(affiliate);
  }

  async createCoupon(dto: CreateCouponDto) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: dto.affiliateId, status: AffiliateStatus.APPROVED },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found or not approved');
    }

    const existing = await this.couponRepository.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Coupon code already exists');

    const coupon = this.couponRepository.create({
      code: dto.code,
      discountPercentage: dto.discountPercentage,
      affiliate,
    });

    // update coupon count for affiliate
    affiliate.couponsCreated += 1;
    await this.affiliateRepository.save(affiliate);

    return this.couponRepository.save(coupon);
  }

  async getCouponsByAffiliate(affiliateId: string) {
    const coupons = await this.couponRepository.find({
      where: { affiliate: { id: affiliateId } },
      relations: ['affiliate'],
    });

    return coupons;
  }
  
  async searchCoupons(filters: SearchCouponsDto) {
  const query = this.couponRepository.createQueryBuilder('coupon')
    .leftJoinAndSelect('coupon.affiliate', 'affiliate');

  if (filters.code) {
    query.andWhere('LOWER(coupon.code) LIKE LOWER(:code)', { code: `%${filters.code}%` });
  }
  return await query.getMany();
}


  async deleteCoupon(couponId: string) {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId },
      relations: ['affiliate'],
    });
  
    if (!coupon) throw new NotFoundException('Coupon not found');
  
    if (coupon.affiliate) {
      coupon.affiliate.couponsCreated = Math.max(0, coupon.affiliate.couponsCreated - 1); // safe
      await this.affiliateRepository.save(coupon.affiliate);
    }
  
    return this.couponRepository.remove(coupon);
  }
  
  async getAllCoupons() {
    return this.couponRepository.find({ relations: ['affiliate'] });
  }

  async updateAffiliate(dto: UpdateAffiliateDto) {
    const affiliate = await this.affiliateRepository.findOne({ where: { id: dto.id } });

    if (!affiliate) throw new NotFoundException('Affiliate not found');

    Object.assign(affiliate, {
      bio: dto.bio ?? affiliate.bio,
      referralLink: dto.referralLink ?? affiliate.referralLink,
    });

    return this.affiliateRepository.save(affiliate);
  }

  async deleteAffiliate(id: string) {
    const affiliate = await this.affiliateRepository.findOne({ where: { id } });

    if (!affiliate) throw new NotFoundException('Affiliate not found');

    return this.affiliateRepository.remove(affiliate);
  }

}
