import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

global['fetch'] = require('node-fetch');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet.hidePoweredBy());
  const configService = app.get(ConfigService);
  const serviceName = configService.get<string>('APP_NAME');
  const logger = new Logger(serviceName);
  const title = configService.get<string>('PROJECT_NAME') + ' - ' + serviceName;
  logger.log(title);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const configSwagger = new DocumentBuilder()
    .setTitle('KezBek Solution - Microservice Authenticator')
    .setDescription(
      'API Documentation for Microservice Authenticator of KezBek Solution',
    )
    .setContact('Sugeng Winanjuar', null, 'winanjuar@gmail.com')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const configCustomSwagger: SwaggerCustomOptions = {
    customSiteTitle: 'KezBek Solution',
    swaggerOptions: { docExpansion: 'none' },
  };

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('apidoc', app, document, configCustomSwagger);

  const port = configService.get<number>('APP_PORT');
  await app.listen(port);
  logger.log(`${serviceName} is running on port ${port}`);
  logger.log(
    `${serviceName} ready to communicate with ServiceCustomer via RabbitMQ`,
  );
}
bootstrap();
