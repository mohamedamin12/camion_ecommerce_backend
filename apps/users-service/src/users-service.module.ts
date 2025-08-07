import { Module } from '@nestjs/common';
import { UsersServiceController } from './users-service.controller';
import { UsersService } from './users-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { OTPService } from './otp-service';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule
  ],
  controllers: [UsersServiceController],
  providers: [UsersService, OTPService],
})
export class UsersServiceModule { }
