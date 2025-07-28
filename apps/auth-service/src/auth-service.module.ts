import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth-service.controller';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: __dirname + '../../../.env', 
    isGlobal: true,
  })],
  controllers: [AuthController],
})
export class AuthServiceModule {}
