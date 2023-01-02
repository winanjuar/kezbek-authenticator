import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BaseResponseDto {
  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }

  @ApiProperty()
  @IsNumber()
  statusCode: number;

  @ApiProperty()
  @IsNotEmpty()
  message: string | string[];
}
