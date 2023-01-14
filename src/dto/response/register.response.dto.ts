import { ApiProperty } from '@nestjs/swagger';
import { BaseCustomerDto } from '../base-customer.dto';
import { BaseResponseDto } from './base.response.dto';

export class RegisterResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: BaseCustomerDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'This is sample message register successfully' })
  message: string;

  @ApiProperty({ type: BaseCustomerDto })
  data: BaseCustomerDto;
}
