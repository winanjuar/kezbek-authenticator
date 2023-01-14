import { OmitType } from '@nestjs/swagger';
import { CustomerDto } from '../customer.dto';

export class RegisterRequestDto extends OmitType(CustomerDto, ['cognito_id']) {}
