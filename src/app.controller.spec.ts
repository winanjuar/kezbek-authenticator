import {
  CanActivate,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { pick } from 'lodash';
import { faker } from '@faker-js/faker';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseCustomerDto } from './dto/core/base-customer.dto';
import { CustomerDto } from './dto/core/customer.dto';
import { TokenDto } from './dto/core/token.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { RegisterResponseDto } from './dto/response/register.response.dto';
import JwtGuard from './auth/jwt.guard';

describe('AppController', () => {
  let controller: AppController;
  let mockUser: CustomerDto;
  let mockRegisterResponse: RegisterResponseDto;
  let mockLoginResponse: LoginResponseDto;

  const mockAppService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockToken: TokenDto = {
    token:
      'eyJraWQiOiJ3VnU5cEtzcW9OQTV3b1BnTG5tbURrZGcwVFdUeDUxSmpsV0ZTR3VHUWE4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MmNlZjIzYi01NWYwLTQ2ZTctODYyYS1iZmU0ZTU0OTA2NDgiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9sdTNWOFBlYjAiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJjb2duaXRvOnVzZXJuYW1lIjoic3lhdXFpYTEiLCJvcmlnaW5fanRpIjoiMWZkNDVkMDctN2JjYi00MDE3LWExZmEtZWNlOGNiMTZhYzBkIiwiYXVkIjoiMmd1M2ZmcGViYWJpaWo2bmVqY3RydW92MDUiLCJldmVudF9pZCI6IjRmOTJmZWQyLWE2ZTgtNGVhMi1hZjBmLTQ4MmQzNWNlNDVmNiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjcyNjYyMDA1LCJwaG9uZV9udW1iZXIiOiIrNjI4MTEzMTAwOTQzIiwiZXhwIjoxNjcyNjY1NjA1LCJpYXQiOjE2NzI2NjIwMDUsImp0aSI6IjExODg1YmI1LTIwNGMtNDYzZC05N2RiLThiOTk0MTU3OWNjMSIsImVtYWlsIjoic3VnZW5nLndpbmFuanVhckBnbWFpbC5jb20ifQ.EjtAjIPsYCxSmLoBdzijuXt7zYBK6xYpd801GTLo_WNqS6KeGgH8RPwysdRxOISpGfYJgk2NtdWnis-5RPPV257-mF4osdEhO5zMWMQbUEt-YS8qINJ_Az9q0PRMlcXgcq70wAVzfOKEEf_QewhbD_J_CFWb5EvTpeX81XrNv9L-XZUGwCgg0kfLLxO6eahDClFKaMmZT1kcxVZ1F_3gWQuQs4Bd8MqIdzdNQQYgljBAPTJgZjFnmR6Ad_9MIMGVtAsiWz0eJf5c2KjeG_wdCtpw0Ez4fL_WoigTYcaKcm2goJWix7P9zAcwZ__UFynnZqoyoQcYAV33qVIrCAQGFw',
    refresh_token:
      'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.V6XG0Gi_Y5k2rxTK3KsWxyT7R9XXOJhi0FvLktLFu_MEuEXhjvWnVKSTHuk591UBLVBDmjkaSlekXubNzAjQg6LhWLnU7m7YAfWEa7VTpTIKgTxJcdkdmB9FcEdjXTP9ck2zXaZU3kT534ZGrk_HjzVEsimwh3Sp__3ixG-xOcAFq4j_UPZfixBH6C_xbzvMCpzYz1booxOeMIUNmRqAXU0wTvHNC7d2gU-rGJijOpZr7vtsuDoPtMVwCyhXTNsnnc9yWm6losizxxOcoHG_5hchgta8TQDD8bUJnzKYJ9qomntFC4MZNjY4tSvtPH59IuwZMuMNsh-YsC2EaABv2A.-AllfM9207sbxHPw.pbQqwCCeDZOZuHh2auLf3nfngQi1XIDgpjpBSfnWbD4Iv1G77O43C1uN9acpT5WgS_jtbz-bYQrSccR0PhavF6XH5DXnvZtNjJRnonIF82twSJqACWu6wRqoIa1ZmOMaXMi8dMfbG98Op5fhH8Tl0kMruqwd6yf-Y_e9RIDLPSbeKzAeLjeL0I6lsT7mHzQrMWonJTlxSOsG8dAza5Id5Dx6BXbquGsfQjSZOL3z60dRS7WYW5FF_RBPA7qKy_amRDHojh4LaZ26y7KMlfniEvf46x7KnYAwZNI9GxL8K4-9em3oeZfsq0EHLtARwfjusGbIDWENEXPUAGkoihZhmyRaNScn4-xFRCO-Z0Ue77tuC2Vk09aothmg_I7Cop04ToqNIM9XtARSpAQfyIPcypmAuArTma4PyMSwyKFyVPJz2iVMF9W5rzTvN-M-QgU9HaQQxjFtFDJfBwbWGrGqEYMQQ4ddsNKwZetPPGZEkdrt85MVsEQ7KjN27PmILI1SCP28rXQluruga2-GgUqRVPcLRAyRFCPw5Kbiq648jqKUahdQAYl9AjJKhE7UcpVAqw04kXCeaQYtDoVw9DSr2gI0aFNdQTGj1wyefghMz-DOrlftzLenPNoLWIPbBWMcDRkstPxsI463Pe4ZVAQ3wzadB-rigagwPHjBrz4K-qZMpPmvJMb1f9NI2EOsKKvA04xpznYQLXR-Jp1gf7ea5UJWkB689OOjDJjptxiCoFa79VKY0IvWBmlvIeq2Xe4rLQOmxxttoBqwbOGR2Z-8o-H2PvkNzIBG63I4KtG2WkuKVJpIk5bCfsAnc35lnluYDb-7bK7LlWv2OMNazEz1ssGodod7WJKHv8qcrm79OG_giJKpEN_85zYs3TYh-2R1JUih20dXjo4SZmjEAGyDlpmnnoJghagSYVg8hhpL7evwTmB_FOF-dPyM0AoBhHwowh4eHG2goi9T9t9Oat4_vKQ86qzHyC01G-VNxfiZJfgl4_XBro2j3ddkrrRPr19xuGQhHSJyqj2DSf-IL_fhgE3_tVwklT7XVH-wxi8huvmgBrRI6QL-kg75W9ZL_tpEBXLEAbD-EQO9Sqan5KnIaz8ympeS45Lvnjuk3SUmdqthgbM7ATh9jMZ_bHuxH1hAZZhoughtmAZgweKphT_m_Elqa2Baqp9viWEM2BZ0VjabPX6Y4NXxaNsOu5zQt1IuxX_uSpr6RgyEN2na3VV1_7aQS1SP-deHzm9DN48RyPNwVNED4326mGXlO3QXU4W72xMGw91jnRtjS6e3joIoscKLImU.a3avvFwXtrweJSvjUESfMw',
  };

  beforeEach(async () => {
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockGuard)
      .compile();

    controller = app.get<AppController>(AppController);

    mockUser = {
      id: '67746a2b-d693-47e1-99f5-f44572aee307',
      name: 'Noura Hilma',
      username: 'nourahilma',
      email: 'noura@gmail.com',
      phone: '+6285712312332',
      password: 'Anfield$Road001',
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should return new account', async () => {
      // arrange
      const registerDto: RegisterRequestDto = pick(mockUser, [
        'name',
        'username',
        'email',
        'phone',
        'password',
      ]);

      const baseCustomer: BaseCustomerDto = pick(mockUser, [
        'id',
        'name',
        'username',
        'email',
        'phone',
      ]);

      const spyRegister = jest
        .spyOn(mockAppService, 'register')
        .mockResolvedValue(baseCustomer);

      mockRegisterResponse = new RegisterResponseDto(
        HttpStatus.OK,
        `Register new account successfully`,
        baseCustomer,
      );

      // act
      const response = await controller.register(registerDto);

      // assert
      expect(response).toEqual(mockRegisterResponse);
      expect(spyRegister).toHaveBeenCalledTimes(1);
      expect(spyRegister).toHaveBeenCalledWith(registerDto);
    });

    it('should throw unprocessable entity when password does not meet AWS standard', async () => {
      // arrange
      const registerDto: RegisterRequestDto = pick(mockUser, [
        'name',
        'username',
        'email',
        'phone',
        'password',
      ]);

      registerDto.password = 'AnfieldRoad112';

      const spyRegister = jest
        .spyOn(mockAppService, 'register')
        .mockRejectedValue({ code: 'InvalidPasswordException' });

      // act
      const funRegister = controller.register(registerDto);

      // assert
      await expect(funRegister).rejects.toEqual(
        new UnprocessableEntityException(
          `Password doesn't meet AWS validation`,
        ),
      );
      expect(spyRegister).toHaveBeenCalledTimes(1);
      expect(spyRegister).toHaveBeenCalledWith(registerDto);
    });

    it('should throw unprocessable entity when user already registered', async () => {
      // arrange
      const registerDto: RegisterRequestDto = pick(mockUser, [
        'name',
        'username',
        'email',
        'phone',
        'password',
      ]);

      const spyRegister = jest
        .spyOn(mockAppService, 'register')
        .mockRejectedValue({ code: 'UsernameExistsException' });

      // act
      const funRegister = controller.register(registerDto);

      // assert
      await expect(funRegister).rejects.toEqual(
        new UnprocessableEntityException(
          `Username ${registerDto.username} already exist`,
        ),
      );
      expect(spyRegister).toHaveBeenCalledTimes(1);
      expect(spyRegister).toHaveBeenCalledWith(registerDto);
    });

    it('should throw internal server error when unknow error occured', async () => {
      // arrange
      const registerDto: RegisterRequestDto = pick(mockUser, [
        'name',
        'username',
        'email',
        'phone',
        'password',
      ]);

      const spyRegister = jest
        .spyOn(mockAppService, 'register')
        .mockRejectedValue('Unknown error');

      // act
      const funRegister = controller.register(registerDto);

      // assert
      await expect(funRegister).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyRegister).toHaveBeenCalledTimes(1);
      expect(spyRegister).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should return new token', async () => {
      // arrange
      const loginDto: LoginRequestDto = pick(mockUser, [
        'username',
        'password',
      ]);

      const spyLogin = jest
        .spyOn(mockAppService, 'login')
        .mockResolvedValue(mockToken);

      mockLoginResponse = new LoginResponseDto(
        HttpStatus.OK,
        `Login successfully`,
        mockToken,
      );

      // act
      const response = await controller.login(loginDto);

      // assert
      expect(response).toEqual(mockLoginResponse);
      expect(spyLogin).toHaveBeenCalledTimes(1);
      expect(spyLogin).toHaveBeenCalledWith(loginDto);
    });

    it('should throw unauthorize when username or password is wrong', async () => {
      // arrange
      const loginDto: LoginRequestDto = pick(mockUser, [
        'username',
        'password',
      ]);

      const spyLogin = jest
        .spyOn(mockAppService, 'login')
        .mockRejectedValue({ code: 'NotAuthorizedException' });

      // act
      const funLogin = controller.login(loginDto);

      // assert
      await expect(funLogin).rejects.toEqual(
        new UnauthorizedException('Sorry, username or password wrong'),
      );
      expect(spyLogin).toHaveBeenCalledTimes(1);
      expect(spyLogin).toHaveBeenCalledWith(loginDto);
    });

    it('should throw internal server error when unknow error occured', async () => {
      // arrange
      const loginDto: LoginRequestDto = pick(mockUser, [
        'username',
        'password',
      ]);

      const spyLogin = jest
        .spyOn(mockAppService, 'login')
        .mockRejectedValue('unknown error');

      // act
      const funLogin = controller.login(loginDto);

      // assert
      await expect(funLogin).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyLogin).toHaveBeenCalledTimes(1);
      expect(spyLogin).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('get-me', () => {
    it('should return authenticated user id', async () => {
      // arrange
      const user = { id: faker.datatype.uuid() };

      // act
      const response = controller.getMe(user);

      // assert
      expect(response).toEqual(user);
    });
  });
});
