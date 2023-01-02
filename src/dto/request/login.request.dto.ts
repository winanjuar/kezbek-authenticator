import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../core/customer.dto';

export class LoginRequestDto extends PickType(CustomerDto, [
  'username',
  'password',
]) {}
