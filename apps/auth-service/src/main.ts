import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  const config = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: config.get('AUTH_SERVICE_HOST'),
      port: Number(config.get('AUTH_TCP_PORT')),
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.get('AUTH_PORT') || 3000);
}
bootstrap();
