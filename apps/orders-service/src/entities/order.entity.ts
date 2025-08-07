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
    price: string;
  }>;


  @Column({ type: 'varchar', default: '0' })
  shippingPrice: string;

  @Column({ type: 'varchar', default: '0' })
  totalOrderPrice: string;

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