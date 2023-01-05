import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
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
import { IdUserRequestDto } from './dto/request/id-user.request.dto';

import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { InternalServerErrorDto } from './dto/response/internal-server-error.response.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { RegisterResponseDto } from './dto/response/register.response.dto';
import { UnauthorizeResponseDto } from './dto/response/unauthorize.response.dto';
import { UnprocessableEntityResponseDto } from './dto/response/unprocessable-entity.response.dto';
import { GetUser } from './decorator/get-user.decorator';
import JwtGuard from './auth/jwt.guard';

@ApiTags('Authenticator')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);

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

      this.logger.log(
        `[POST, /register] Register new customer ${account.id} successfully`,
      );
      return new RegisterResponseDto(
        HttpStatus.OK,
        'Register new account successfully',
        account,
      );
    } catch (error) {
      switch (error.code) {
        case 'InvalidPasswordException':
          this.logger.log(
            `[POST, /register] Password doesn't meet AWS validation`,
          );
          throw new UnprocessableEntityException(
            `Password doesn't meet AWS validation`,
          );
        case 'UsernameExistsException':
          this.logger.log(
            `[POST, /register] Username ${registerDto.username} already exist`,
          );
          throw new UnprocessableEntityException(
            `Username ${registerDto.username} already exist`,
          );
        default:
          this.logger.log(`[POST, /register] Unknown error`);
          throw new InternalServerErrorException();
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
      this.logger.log(
        `[POST, /login] Login ${loginRequest.username} successfully`,
      );
      return new LoginResponseDto(HttpStatus.OK, 'Login successfully', token);
    } catch (error) {
      if (error.code === 'NotAuthorizedException') {
        this.logger.log(`[POST, /login] Sorry, username or password wrong`);
        throw new UnauthorizedException('Sorry, username or password wrong');
      }
      this.logger.log(`[POST, /login] Unknown error`);
      throw new InternalServerErrorException();
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('get-me')
  getMe(@GetUser() user: IdUserRequestDto) {
    this.logger.log(
      `[GET, /get-me] Decode token for user ${user.id} successfully`,
    );
    return user;
  }
}
