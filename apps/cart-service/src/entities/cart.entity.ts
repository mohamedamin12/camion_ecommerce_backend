import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'float', nullable: true })
  price?: number;

  @Column({ nullable: true })
  couponCode?: string;

  @Column({ type: 'float', nullable: true, default: 0 })
  discountPercentage?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
