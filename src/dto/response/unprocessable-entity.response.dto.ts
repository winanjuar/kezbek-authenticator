import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base.response.dto';

export class UnprocessableEntityResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({
    example: `This is sample message unprocessable entity`,
  })
  message: string;

  @ApiProperty({ example: 'Unprocessable Entity' })
  error: string;
}
