import { NestFactory, Reflector } from '@nestjs/core'; // 👈 Added Reflector
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'; // 👈 Added ClassSerializerInterceptor

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // 1. Global Serialization (This makes @Exclude work globally)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 2. Global Validation & Transformation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // 👈 Critical for Class Transformer
  }));

  app.enableCors({
    origin: true, 
    credentials: true, 
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();