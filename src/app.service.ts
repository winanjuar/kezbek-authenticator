import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { AuthConfig } from './auth/auth.config';
import { ClientProxy } from '@nestjs/microservices';
import { TokenDto } from './dto/token.dto';
import { EPatternMessage } from './core/pattern-message.enum';
import { IBaseCustomer } from './core/base-customer.interface';

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
            const customer: IBaseCustomer = {
              cognito_id: result.userSub,
              name,
              username,
              email,
              phone,
            };
            this.customerClient.emit(EPatternMessage.REGISTER, customer);
            this.logger.log(
              `[${EPatternMessage.REGISTER}] [${customer.cognito_id}] Sent data customer to ServiceCustomer`,
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
