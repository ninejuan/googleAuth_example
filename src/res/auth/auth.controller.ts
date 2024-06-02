import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Redirect, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google.guard';
import { CallbackUserData } from './decorator/auth.decorator';
import Auth from 'src/interface/auth.interface';
import Token from 'src/interface/token.interface';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@ApiExcludeEndpoint()
	@Get('google/cb')
	@UseGuards(GoogleAuthGuard)
	async GoogleCallback(
		@CallbackUserData() userData: any,
		@Res() res: Response,
	) {
		//project-17222372568
		console.log('controller - userdata' + userData);
		// console.log(res);
		res.redirect('/');
	}

	@Get('/hi')
	async hi() {
		return 'hi';
	}
}

/**
 * Authentication API METHOD
 * GET : LogIn
 * POST : LogOut
 * DELETE : Rm ACC
 * PATCH METHOD에서 진행할 작업을 strategy에서 진행하는 관계로 패치 메서드는 작성하지 않음.
 */