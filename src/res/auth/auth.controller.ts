import { Body, Controller, Get, HttpException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalGuard } from '../common/guards/local.guard';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { GoogleGuard } from '../common/guards/google.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post('login')
    @UseGuards(LocalGuard)
    login(@Req() req: Request) {
        return req.user; // returning the jwt token
    }
    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req: Request) {
        console.log('inside status');
        console.log({u: req.user})
        return 'status';
    }

    @Get('google/login')
    @UseGuards(GoogleGuard)
    async googleLogin() {

    }

    @Get('google/callback')
    @UseGuards(GoogleGuard)
    async callback(@Req() req: Request) {
        console.log({yoyo: req.user})
        // const {} = req.user
        const token = await this.authService.generateToken({...req.user});
        return token;
    }
}
