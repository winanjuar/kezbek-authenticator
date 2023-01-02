import { OmitType } from '@nestjs/swagger';
import { CustomerDto } from '../core/customer.dto';

export class RegisterRequestDto extends OmitType(CustomerDto, ['id']) {}
