import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Request,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { BaseCustomerDto } from './dto/core/base-customer.dto';
import { TokenDto } from './dto/core/token.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';

import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { InternalServerErrorDto } from './dto/response/internal-server-error.response.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { RegisterResponseDto } from './dto/response/register.response.dto';
import { UnauthorizeResponseDto } from './dto/response/unauthorize.response.dto';
import { UnprocessableEntityResponseDto } from './dto/response/unprocessable-entity.response.dto';
import JwtAuthenticationGuard from './jwt/jwt.guard';

@ApiTags('Authenticator')
@Controller({ version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: RegisterRequestDto })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @Post('register')
  async register(@Body() registerDto: RegisterRequestDto) {
    try {
      const account = (await this.appService.register(
        registerDto,
      )) as BaseCustomerDto;
      return new RegisterResponseDto(
        HttpStatus.OK,
        'Register new account successfully',
        account,
      );
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case 'InvalidPasswordException':
          throw new UnprocessableEntityException(
            `Password doesn't meet AWS validation`,
          );
        case 'UsernameExistsException':
          throw new UnprocessableEntityException(
            `Username ${registerDto.username} already exist`,
          );
        default:
          throw new InternalServerErrorException('Unknown error');
      }
    }
  }

  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginRequestDto })
  @ApiUnauthorizedResponse({ type: UnauthorizeResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @Post('login')
  async login(@Body() loginRequest: LoginRequestDto) {
    try {
      const token = (await this.appService.login(loginRequest)) as TokenDto;
      return new LoginResponseDto(HttpStatus.OK, 'Login successfully', token);
    } catch (error) {
      if (error.code === 'NotAuthorizedException') {
        throw new UnauthorizedException('Sorry, username or password wrong');
      }
      throw new InternalServerErrorException('Unknown error');
    }
  }

  @ApiBearerAuth()
  @Get('check')
  @UseGuards(JwtAuthenticationGuard)
  async check(@Request() req: any) {
    try {
      return req.user;
    } catch (error) {
      throw new InternalServerErrorException('Unknown error');
    }
  }
}
