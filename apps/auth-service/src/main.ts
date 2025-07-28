import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
dotenv.config();

dotenv.config({ path: __dirname + '../../../.env' });


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthServiceModule, {
    transport: Transport.TCP,
    options: {
      host:  process.env.TCP_HOST ,
      port: parseInt(process.env.TCP_PORT || ""),
    },
  });

  await app.listen();
  console.log('Auth Service is running on TCP port 4001');
}
bootstrap();
