import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './res/auth/auth.module';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
