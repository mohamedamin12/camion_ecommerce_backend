import { NestFactory } from '@nestjs/core';
import { CartServiceModule } from './cart-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CartServiceModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.TCP_BIND_HOST,
      port: Number(process.env.CART_TCP_PORT || ""),
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen();
}
bootstrap();
