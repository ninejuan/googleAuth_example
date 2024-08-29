// import { Body, Controller, Get, HttpException, Post, Req, Res, UseGuards } from '@nestjs/common';
// import { AuthPayloadDto } from './dto/auth.dto';
// import { AuthService } from './auth.service';
// import { AuthGuard } from '@nestjs/passport';
// import { LocalGuard } from '../common/guards/local.guard';
// import { Request, Response } from 'express';
// import { JwtAuthGuard } from '../common/guards/jwt.guard';
// import { GoogleGuard } from '../common/guards/google.guard';

// @Controller('auth')
// export class AuthController {
//     constructor(private authService: AuthService) {}
//     @Post('login')
//     @UseGuards(LocalGuard)
//     login(@Req() req: Request) {
//         return req.user; // returning the jwt token
//     }
//     @Get('status')
//     @UseGuards(JwtAuthGuard)
//     status(@Req() req: Request) {
//         console.log('inside status');
//         console.log({u: req.user})
//         return 'status';
//     }

//     @Get('google/login')
//     @UseGuards(GoogleGuard)
//     async googleLogin() {

//     }

//     @Get('google/callback')
//     @UseGuards(GoogleGuard)
//     async callback(@Req() req: Request) {
//         console.log({yoyo: req.user})
//         // const {} = req.user
//         const token = await this.authService.generateToken({...req.user});
//         return token;
//     }
// }
import { Controller, Get, UseGuards, Req, Res, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleGuard } from 'src/res/common/guards/google.guard'; // Import your custom Google Auth Guard
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('google')
    @UseGuards(GoogleGuard)
    async googleAuth() {
        // Initiates the Google OAuth2 login flow
    }

    @Get('google/redirect')
    @UseGuards(GoogleGuard)
    async googleAuthRedirect(
        @Req() req: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const user = req.user;
        const tokens = await this.authService.handleGoogleLogin(user);

        // Set refreshToken in an HttpOnly cookie
        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true, // set to true in production
            sameSite: 'strict', // protect against CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect or send access token based on your flow
        return response.json({ accessToken: tokens.accessToken });
    }

    @Get('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const newTokens = await this.authService.refreshAccessToken(refreshToken);

        // Update the refreshToken cookie
        response.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: true, // set to true in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return { accessToken: newTokens.accessToken };
    }

    @Get('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true, // set to true in production
            sameSite: 'strict',
        });

        return { message: 'Logged out successfully' };
    }
}
