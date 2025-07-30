import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productImage: string;

  @Column('float', { default: 0 })
  price: number;
}
