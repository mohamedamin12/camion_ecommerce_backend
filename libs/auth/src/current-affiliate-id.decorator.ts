/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAffiliateId = createParamDecorator(
   (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
     return request.user?.affiliateId;
}
);
