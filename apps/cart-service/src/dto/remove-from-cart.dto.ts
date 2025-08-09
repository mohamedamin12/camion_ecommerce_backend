import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveFromCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
