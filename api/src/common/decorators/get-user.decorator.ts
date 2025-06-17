import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserId } from "src/types/types";

export const GetUserId = createParamDecorator((data: unknown, ctx: ExecutionContext): UserId => {
  const request = ctx.switchToHttp().getRequest();
  return request.userId;
});
