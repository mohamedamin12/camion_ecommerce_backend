import { IsString, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
