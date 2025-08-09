import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class AddToWishlistDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsUrl()
  productImage: string;

  @IsNumber()
  price: number;
}
