import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveFromCartDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;
}
