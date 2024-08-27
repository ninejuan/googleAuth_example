import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/User';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { SessionSerializer } from './utils/Serializer';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
  ],
})
export class AuthModule {}
