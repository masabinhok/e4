import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MongooseId } from 'src/types/types';

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): MongooseId => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
  },
);
