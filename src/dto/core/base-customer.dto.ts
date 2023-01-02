import { OmitType } from '@nestjs/swagger';
import { CustomerDto } from './customer.dto';

export class BaseCustomerDto extends OmitType(CustomerDto, ['password']) {}
