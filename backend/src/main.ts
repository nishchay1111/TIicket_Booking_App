import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  // 1. Serve static files from DataStore/Posters ─────────────────────────
  app.useStaticAssets(join(__dirname, '..', 'DataStore', 'Posters'), { // 👈 fixed — one less '..'
    prefix: '/posters',
  });

  // 2. Global Serialization (This makes @Exclude work globally) ──────────
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 3. Global Validation & Transformation ────────────────────────────────
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

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🖼️  Posters served at: http://localhost:${port}/posters`);
}
bootstrap();