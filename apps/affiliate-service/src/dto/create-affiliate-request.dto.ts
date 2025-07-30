import { IsUUID } from 'class-validator';

export class CreateAffiliateRequestDto {
  @IsUUID()
  userId: string;
}
