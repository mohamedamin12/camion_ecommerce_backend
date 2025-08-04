import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import helmet from 'helmet';

dotenv.config();
dotenv.config({ path: __dirname + '../../../.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    
  
  // app.useGlobalGuards(new JwtAuthGuard(Reflector));
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  
  await app.listen(process.env.API_GATEWAY_HTTP_PORT || 5000);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.TCP_HOST,
      port: parseInt(process.env.API_GATEWAY_TCP_PORT || '4000'),
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
