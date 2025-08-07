import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsArray()
  cartItems: Array<{
    productId: string;
    title?: string;
    image?: string;
    quantity: number;
    price: string; 
  }>;

  @IsOptional()
  @IsString()
  taxPrice?: string;

  @IsOptional()
  @IsString()
  shippingPrice?: string;

  @IsNotEmpty()
  @IsString()
  totalOrderPrice: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
