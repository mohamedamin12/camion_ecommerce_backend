import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

dotenv.config();

dotenv.config({ path: __dirname + '../../../.env' });


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersServiceModule ,  {
    transport: Transport.TCP,
    options: {
      host:  process.env.TCP_BIND_HOST ,
      port: parseInt(process.env.USERS_TCP_PORT || ""),
    },
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen();

}
bootstrap();
