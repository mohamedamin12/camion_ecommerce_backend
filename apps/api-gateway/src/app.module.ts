import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host:  process.env.USERS_HOST,
          port: Number(process.env.USERS_TCP_PORT),
        }, 
      }
    ]),
  ],
  controllers: [AppController ],
})
export class AppModule {}
