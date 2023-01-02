import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../core/customer.dto';

export class UserRequestDto extends PickType(CustomerDto, ['id']) {}
