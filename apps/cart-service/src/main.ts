import { NestFactory } from '@nestjs/core';
import { CartServiceModule } from './cart-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CartServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 4003,
    },
  });

  await app.listen();
  console.log('Cart Service is running on TCP port 4003');
}
bootstrap();
