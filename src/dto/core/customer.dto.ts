import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class CustomerDto {
  @ApiProperty()
  @IsUUID(4)
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contains lowercase, uppercase, numberic and special character',
  })
  password: string;
}
