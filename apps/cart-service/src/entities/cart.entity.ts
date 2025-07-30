import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string; // From Buckydrop

  @Column()
  quantity: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'float', nullable: true })
  price?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
