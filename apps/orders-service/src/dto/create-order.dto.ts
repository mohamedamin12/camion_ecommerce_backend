import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BillingAddressDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postcode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateOrderDto {
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

  // Additional fields for WooCommerce integration
  @IsOptional()
  @IsString()
  paymentMethodType?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @IsOptional()
  paymentData?: any[];
}
