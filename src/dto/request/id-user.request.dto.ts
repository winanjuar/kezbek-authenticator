import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../customer.dto';

export class IdUserRequestDto extends PickType(CustomerDto, ['cognito_id']) {}
