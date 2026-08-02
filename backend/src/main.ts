import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { join } from 'path';

/**
 * Bootstraps the core NestJS application instance, configuring global middleware,
 * filesystem asset routing pipelines, interceptors, validation pipes, and CORS policies.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'DataStore', 'Posters'), {
    prefix: '/posters',
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 5001;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Posters served at: http://localhost:${port}/posters`);
}
bootstrap();