import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveFromWishlistDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
