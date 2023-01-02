import { CanActivate, ExecutionContext } from '@nestjs/common';
import * as faker from 'faker';

export class JwtGuardMock implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { id: faker.datatype.uuid() };

    return true;
  }
}
