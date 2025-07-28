import { NestFactory } from '@nestjs/core';
import { OrdersServiceModule } from './orders-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrdersServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 4004,
    },
  });

  await app.listen();
  console.log('Orders Service is running on TCP port 4004');
}
bootstrap();
