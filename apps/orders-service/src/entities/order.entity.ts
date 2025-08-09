import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'jsonb' })
  cartItems: Array<{
    productId: string;
    title?: string;
    image?: string;
    quantity: number;
    price: string;
  }>;

  // Add taxPrice field to match your DTO
  @Column({ type: 'varchar', default: '0', nullable: true })
  taxPrice?: string;

  @Column({ type: 'varchar', default: '0' })
  shippingPrice: string;

  @Column({ type: 'varchar', default: '0' })
  totalOrderPrice: string;

  @Column({ default: 'card' })
  paymentMethodType: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'text', nullable: true })
  shippingAddress?: string;

  // WooCommerce Integration Fields
  @Column({ nullable: true })
  wooCommerceOrderId?: number;

  @Column({ nullable: true })
  wooCommerceOrderNumber?: string;

  @Column({ nullable: true })
  wooCommerceStatus?: string;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address1?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
