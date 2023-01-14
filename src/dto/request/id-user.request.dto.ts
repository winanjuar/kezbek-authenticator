import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../core/customer.dto';

export class IdUserRequestDto extends PickType(CustomerDto, ['cognito_id']) {}
