import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private userPool: CognitoUserPool;

  constructor(
    @Inject('CustomerService') private readonly customerClient: ClientProxy,
    private authConfig: AuthConfig,
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    });

    this.customerClient.connect();
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
              cognito_id: result.userSub,
              name,
              username,
              email,
              phone,
            };
            this.customerClient.emit('ep_register', customer);
            this.logger.log(
              `Data new customer ${customer.cognito_id} sent to ServiceCustomer`,
            );
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
