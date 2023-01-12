import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base.response.dto';

export class UnauthorizeResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({
    example: `This is sample message unauthorized`,
  })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}
