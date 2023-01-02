import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base.response.dto';

export class BadRequestResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: ['email must be an email', 'phone must be a phone number'],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
