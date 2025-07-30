import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Coupon } from './coupon.entity';

export enum AffiliateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('affiliates')
export class Affiliate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ type: 'enum', enum: AffiliateStatus, default: AffiliateStatus.PENDING })
  status: AffiliateStatus;

  @Column({ type: 'float', default: 0 })
  totalEarnings: number;

  @Column({ type: 'int', default: 0 })
  couponsCreated: number;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  referralLink: string;


  @OneToMany(() => Coupon, (coupon) => coupon.affiliate)
  coupons: Coupon[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
