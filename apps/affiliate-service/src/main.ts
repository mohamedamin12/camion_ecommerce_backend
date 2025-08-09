import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AffiliateServiceModule } from './affiliate-service.module';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AffiliateServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.TCP_BIND_HOST || '0.0.0.0',
        port: Number(process.env.AFFILIATE_TCP_PORT),
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,         
    }),
  );
  await app.listen();

}
bootstrap();
