/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    console.log('Request user:', request.user); 
    
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated - no user in request');
    }
    
    const userId = request.user.sub || request.user.id;
    
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token payload');
    }
    
    return userId;
  },
);
