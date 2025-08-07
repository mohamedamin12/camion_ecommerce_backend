import { IsNotEmpty, IsString } from "class-validator";

export class CheckProductInWishlistDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
