import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../customer.dto';

export class LoginRequestDto extends PickType(CustomerDto, [
  'username',
  'password',
]) {}
