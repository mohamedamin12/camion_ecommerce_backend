import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  cartItems: Array<{
    productId: string;
    title?: string;
    image?: string;
    quantity: number;
    price: number;
  }>;

  @IsNumber()
  @IsOptional()
  taxPrice?: number;

  @IsNumber()
  @IsOptional()
  shippingPrice?: number;

  @IsNumber()
  totalOrderPrice: number;

  @IsString()
  @IsOptional()
  shippingAddress?: string;
}