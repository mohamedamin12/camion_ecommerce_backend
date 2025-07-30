import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveFromWishlistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;
}
