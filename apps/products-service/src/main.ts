import * as dotenv from 'dotenv'
import { NestFactory } from '@nestjs/core';
import { ProductsServiceModule } from './products-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProductsServiceModule, {
    transport: Transport.TCP,
    options: {
      host:  process.env.TCP_HOST || '127.0.0.1',
      port: parseInt(process.env.TCP_PORT || "") || 4001,
    },
  });

  await app.listen();
  console.log('Products Service is running on TCP port 4002');
}
bootstrap();
