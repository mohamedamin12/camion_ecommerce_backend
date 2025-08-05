import { IsNotEmpty, IsString } from "class-validator";

export class CheckProductInCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
