import { ApiProperty } from '@nestjs/swagger';
import { TokenDto } from '../core/token.dto';
import { BaseResponseDto } from './base.response.dto';

export class LoginResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: TokenDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'This is sample message login successfully' })
  message: string;

  @ApiProperty({ type: TokenDto })
  data: TokenDto;
}
