import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
