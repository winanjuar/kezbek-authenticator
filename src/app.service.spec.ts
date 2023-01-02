import { Test, TestingModule } from '@nestjs/testing';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import * as faker from 'faker';
import { AppService } from './app.service';
import { AuthConfig } from './auth/auth.config';
import { BaseCustomerDto } from './dto/core/base-customer.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';

describe.skip('AppService', () => {
  let appService: AppService;
  let mockCognitoUserPool: Partial<CognitoUserPool>;
  const mockAuthConfig = {
    userPoolId: 'fake',
    clientId: 'fake',
    region: 'fake',
    authority: 'fake',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: AuthConfig, useValue: mockAuthConfig },
        { provide: CognitoUserPool, useValue: mockCognitoUserPool },
      ],
    }).compile();

    mockCognitoUserPool = {
      signUp: jest.fn((a, b, c, d, cb) => cb),
    };
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should resolve', async () => {
      // arrange
      const registerDto: RegisterRequestDto = {
        name: 'Sugeng Winanjuar',
        username: 'winanjuar',
        email: 'winanjuar@gmail.com',
        phone: '+62811310094',
        password: 'Anfield$Road01',
      };

      const mockCognitoUser = {
        userSub: faker.datatype.uuid(),
        username: registerDto.username,
      };

      const expected: BaseCustomerDto = {
        id: faker.datatype.uuid(),
        name: registerDto.name,
        username: registerDto.username,
        email: registerDto.email,
        phone: registerDto.phone,
      };

      mockCognitoUserPool.signUp = jest
        .fn()
        .mockImplementation((a, b, c, d, cb) => {
          cb(null, mockCognitoUser);
        });

      // const result = mockCognitoUserPool.signUp.mockImplementation(
      //   (a, b, c, d, cb) => cb(null, mockCognitoUser),
      // );
      // const spySignUp = jest.spyOn(mockCognitoUserPool, 'signUp');

      // console.log(spySignUp);
      // act
      const funRegister = appService.register(registerDto);

      // assert
      await expect(funRegister).resolves.toBe(expected);
    });
  });
});
