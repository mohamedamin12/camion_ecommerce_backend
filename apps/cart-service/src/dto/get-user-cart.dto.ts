import { IsString } from 'class-validator';

export class GetUserCartDto {
  @IsString()
  userId: string;
}
