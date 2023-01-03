import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthConfig } from './auth/auth.config';
import { CognitoStrategy } from './auth/cognito.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PassportModule.registerAsync({
      useFactory: async () => ({
        defaultStrategy: 'jwt',
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'CustomerService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_CUSTOMER'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, AuthConfig, CognitoStrategy],
})
export class AppModule {}
