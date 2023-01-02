import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base.response.dto';

export class UnauthorizeResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({
    example: `Sorry, username or password wrong`,
  })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}
