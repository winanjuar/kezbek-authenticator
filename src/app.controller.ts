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
import { BaseCustomerDto } from './dto/base-customer.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { IdUserRequestDto } from './dto/request/id-user.request.dto';

import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { InternalServerErrorResponseDto } from './dto/response/internal-server-error.response.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { RegisterResponseDto } from './dto/response/register.response.dto';
import { UnauthorizeResponseDto } from './dto/response/unauthorize.response.dto';
import { UnprocessableEntityResponseDto } from './dto/response/unprocessable-entity.response.dto';
import { GetUser } from './decorator/get-user.decorator';
import JwtGuard from './auth/jwt.guard';
import { TokenDto } from './dto/token.dto';

@ApiTags('Authenticator')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: RegisterRequestDto })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('register')
  async register(@Body() registerDto: RegisterRequestDto) {
    const logIdentifier = 'POST register';
    try {
      const account = (await this.appService.register(
        registerDto,
      )) as BaseCustomerDto;

      this.logger.log(
        `[${logIdentifier}] [${account.cognito_id}] Register new customer successfully`,
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
            `[${logIdentifier}] Password doesn't meet AWS validation`,
          );
          throw new UnprocessableEntityException(
            `Password doesn't meet AWS validation`,
          );
        case 'UsernameExistsException':
          this.logger.log(
            `[${logIdentifier}] Username ${registerDto.username} already exist`,
          );
          throw new UnprocessableEntityException(
            `Username ${registerDto.username} already exist`,
          );
        default:
          this.logger.log(`[${logIdentifier}] Unknown error`);
          throw new InternalServerErrorException();
      }
    }
  }

  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginRequestDto })
  @ApiUnauthorizedResponse({ type: UnauthorizeResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('login')
  async login(@Body() loginRequest: LoginRequestDto) {
    const logIdentifier = 'POST login';
    try {
      const token = (await this.appService.login(loginRequest)) as TokenDto;
      this.logger.log(
        `[${logIdentifier}] [${loginRequest.username}] Login successfully`,
      );
      return new LoginResponseDto(HttpStatus.OK, 'Login successfully', token);
    } catch (error) {
      if (error.code === 'NotAuthorizedException') {
        this.logger.log(`[${logIdentifier}] Sorry, username or password wrong`);
        throw new UnauthorizedException('Sorry, username or password wrong');
      }
      this.logger.log(`[${logIdentifier}] Unknown error`);
      throw new InternalServerErrorException();
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('try-get-me')
  getMe(@GetUser() user: IdUserRequestDto) {
    const logIdentifier = 'GET try-get-me';
    this.logger.log(
      `[${logIdentifier}] [${user.cognito_id}] Decode token user successfully`,
    );
    return user;
  }
}
