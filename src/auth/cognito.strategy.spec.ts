import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as faker from 'faker';
import { CognitoStrategy } from './cognito.strategy';
import { AuthConfig } from './auth.config';

describe('CognitoStrategy', () => {
  let cognitoStrategy: CognitoStrategy;
  const mockAuthConfig = {
    userPoolId: 'fake',
    clientId: 'fake',
    region: 'fake',
    authority: 'fake',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CognitoStrategy,
        {
          provide: AuthConfig,
          useValue: mockAuthConfig,
        },
      ],
    }).compile();

    cognitoStrategy = module.get<CognitoStrategy>(CognitoStrategy);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(cognitoStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return existing user', async () => {
      // arrange
      const payload = {
        sub: faker.datatype.uuid(),
        email_verified: false,
        origin_jti: faker.datatype.uuid(),
        aud: faker.random.alphaNumeric(26),
        event_id: faker.datatype.uuid(),
        token_use: 'id',
        auth_time: 1672671596,
        phone_number: '+628113541231',
        jti: faker.datatype.uuid(),
        email: faker.internet.email(),
      };
      const userMock = { id: payload.sub };

      // act
      const response = await cognitoStrategy.validate(payload);

      // assert
      expect(response).toEqual(userMock);
    });

    it('should throw unathorized exception when missing values in payload', async () => {
      const payload = {
        sid: faker.datatype.uuid(),
        email_verified: false,
        origin_jti: faker.datatype.uuid(),
        aud: faker.random.alphaNumeric(26),
        event_id: faker.datatype.uuid(),
        token_use: 'id',
        auth_time: 1672671596,
        phone_number: '+628113541231',
        jti: faker.datatype.uuid(),
        email: faker.internet.email(),
      };

      await expect(cognitoStrategy.validate(payload)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
