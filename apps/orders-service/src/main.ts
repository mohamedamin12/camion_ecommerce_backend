import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrdersServiceModule } from './orders-service.module';

dotenv.config();

dotenv.config({ path: __dirname + '../../../.env' });


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrdersServiceModule ,  {
    transport: Transport.TCP,
    options: {
      host:  process.env.TCP_BIND_HOST ,
      port: Number(process.env.ORDERS_TCP_PORT || ""),
    },
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen();

}
bootstrap();