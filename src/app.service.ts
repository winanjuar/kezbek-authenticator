import { Injectable } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { BaseCustomerDto } from './dto/core/base-customer.dto';
import { TokenDto } from './dto/core/token.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { AuthConfig } from './auth/auth.config';

@Injectable()
export class AppService {
  private userPool: CognitoUserPool;

  constructor(private authConfig: AuthConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    });
  }

  async register(registerDto: RegisterRequestDto) {
    const { name, username, email, phone, password } = registerDto;
    return new Promise((resolve, reject) => {
      return this.userPool.signUp(
        username,
        password,
        [
          new CognitoUserAttribute({ Name: 'email', Value: email }),
          new CognitoUserAttribute({
            Name: 'phone_number',
            Value: phone,
          }),
        ],
        null,
        (err, result) => {
          if (!result) {
            reject(err);
          } else {
            const customer: BaseCustomerDto = {
              id: result.userSub,
              name,
              username,
              email,
              phone,
            };
            resolve(customer);
          }
        },
      );
    });
  }

  async login(user: LoginRequestDto) {
    const { username, password } = user;
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const userData = {
      Username: username,
      Pool: this.userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      return cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const token = result.getIdToken().getJwtToken();
          const refresh_token = result.getRefreshToken().getToken();
          resolve({ token, refresh_token } as TokenDto);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
}
