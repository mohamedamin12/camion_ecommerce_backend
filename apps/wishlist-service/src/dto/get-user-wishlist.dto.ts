import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserWishlistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
