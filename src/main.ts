import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';

global['fetch'] = require('node-fetch');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
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

  const PORT = configService.get<number>('APP_PORT');
  await app.listen(PORT);
}
bootstrap();
