import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { ValidationExceptionFilter } from './core/filters/exception-filters';
import { AllExceptionsFilter } from './core/filters/all-exception-filters';
import { UsersService } from './users/services/users.service';

async function bootstrap() {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
 
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });  
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const API_DEFAULT_PORT = Number(process.env.PORT ?? 3000);
  const config = new DocumentBuilder()
    .setTitle('RyPay')
    .setDescription('RyPay Endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, stopAtFirstError: true }),
  );
  app.useGlobalFilters(new ValidationExceptionFilter(), new AllExceptionsFilter());
  app.enableCors();
  app.use(json({ limit: '50mb' }));
  SwaggerModule.setup('api', app, document);
  app.use(helmet());
  const logger = app.get(Logger);
  app.useLogger(logger);
  await app.listen(API_DEFAULT_PORT).then(() => {
    logger.log('server started');
  });
  //   const scriptService = app.get(UsersService);
  // await scriptService.MergeAccountsForUsersWithoutVA();
}
bootstrap();
