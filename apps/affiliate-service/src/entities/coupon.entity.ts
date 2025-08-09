import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Affiliate } from './affiliate.entity';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Affiliate, (affiliate) => affiliate.coupons, { onDelete: 'CASCADE' })
  affiliate: Affiliate;

  @Column('float')
  discountPercentage: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
