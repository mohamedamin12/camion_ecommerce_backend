import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



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
    price: number;
  }>;


  @Column({ type: 'float', default: 0 })
  shippingPrice: number;

  @Column({ type: 'float', default: 0 })
  totalOrderPrice: number;

  @Column({ default: 'card' })
  paymentMethodType: string

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}