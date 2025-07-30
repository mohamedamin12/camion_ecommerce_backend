import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
