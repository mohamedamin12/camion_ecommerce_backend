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
  private async generateInitialCoupons(affiliate: Affiliate) {
    const coupons: Coupon[] = [];
    for (let i = 1; i <= 3; i++) {
      const code = `WELCOME${i}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const coupon = this.couponRepository.create({
        code,
        discountPercentage: 10,
        affiliate,
      });
      coupons.push(coupon);
    }
    await this.couponRepository.save(coupons);
    affiliate.couponsCreated += 3;
    await this.affiliateRepository.save(affiliate);
  }
  
  constructor(
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) { }

  async createAffiliateRequest(dto: CreateAffiliateRequestDto) {
    try {
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

      const savedAffiliate = await this.affiliateRepository.save(affiliate);

      if (savedAffiliate.status === AffiliateStatus.APPROVED) {
        await this.generateInitialCoupons(savedAffiliate);
      }

      return savedAffiliate;
    } catch (error) {
      return new Error(error instanceof Error ? error.message : 'Failed to create affiliate request');
    }
  }

  async getPendingRequests() {
    try {
      return await this.affiliateRepository.find({ where: { status: AffiliateStatus.PENDING } });
    } catch (error) {
      return new Error(error instanceof Error ? error.message : 'Failed to get pending requests');
    }
  }

  async reviewAffiliateRequest(dto: ReviewAffiliateRequestDto) {
    try {
      const affiliate = await this.affiliateRepository.findOne({ where: { id: dto.affiliateId } });
      if (!affiliate) throw new NotFoundException('Affiliate not found');

      affiliate.status = dto.status;
      const savedAffiliate = await this.affiliateRepository.save(affiliate);

      if (dto.status === AffiliateStatus.APPROVED) {
        const prevAffiliate = await this.affiliateRepository.findOne({ where: { id: dto.affiliateId } });
        if (prevAffiliate && prevAffiliate.status !== AffiliateStatus.APPROVED) {
          await this.generateInitialCoupons(savedAffiliate);
        }
      }

      return savedAffiliate;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      return new Error(error instanceof Error ? error.message : 'Failed to review affiliate request');
    }
  }

  async createCoupon(dto: CreateCouponDto) {
    try {
      const affiliate = await this.affiliateRepository.findOne({
        where: { id: dto.affiliateId, status: AffiliateStatus.APPROVED },
      });

      if (!affiliate) {
        return new NotFoundException('Affiliate not found or not approved');
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      return new Error(error instanceof Error ? error.message : 'Failed to create coupon');
    }
  }

  async getCouponsByAffiliate(affiliateId: string) {
    try {
      const coupons = await this.couponRepository.find({
        where: { affiliate: { id: affiliateId } },
        relations: ['affiliate'],
      });
      return coupons;
    } catch (error) {
      return new Error(error instanceof Error ? error.message : 'Failed to get coupons by affiliate');
    }
  }

  async searchCoupons(filters: SearchCouponsDto) {
    try {
      const query = this.couponRepository.createQueryBuilder('coupon')
        .leftJoinAndSelect('coupon.affiliate', 'affiliate');

      if (filters.code) {
        query.andWhere('LOWER(coupon.code) LIKE LOWER(:code)', { code: `%${filters.code}%` });
      }
      return await query.getMany();
    } catch (error) {
      return new Error(error instanceof Error ? error.message : 'Failed to search coupons');
    }
  }

  async deleteCoupon(couponId: string) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      return new Error(error instanceof Error ? error.message : 'Failed to delete coupon');
    }
  }

  async getAllCoupons() {
    try {
      return await this.couponRepository.find({ relations: ['affiliate'] });
    } catch (error) {
      return new Error(error instanceof Error ? error.message : 'Failed to get all coupons');
    }
  }

  async updateAffiliate(dto: UpdateAffiliateDto) {
    try {
      const affiliate = await this.affiliateRepository.findOne({ where: { id: dto.id } });

      if (!affiliate) throw new NotFoundException('Affiliate not found');

      Object.assign(affiliate, {
        bio: dto.bio ?? affiliate.bio,
        referralLink: dto.referralLink ?? affiliate.referralLink,
      });

      return this.affiliateRepository.save(affiliate);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      return new Error(error instanceof Error ? error.message : 'Failed to update affiliate');
    }
  }

  async deleteAffiliate(id: string) {
    try {
      const affiliate = await this.affiliateRepository.findOne({ where: { id } });

      if (!affiliate) throw new NotFoundException('Affiliate not found');

      return this.affiliateRepository.remove(affiliate);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      return new Error(error instanceof Error ? error.message : 'Failed to delete affiliate');
    }
  }

}
