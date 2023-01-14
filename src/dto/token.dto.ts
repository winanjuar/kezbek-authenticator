import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class TokenDto {
  @ApiProperty()
  @IsJWT()
  token: string;

  @ApiProperty()
  @IsJWT()
  refresh_token: string;
}
