import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../../auth/auth.service";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }
    validate(email: string, password: string) {
        // console.log({email, password})
        let username = email;
        const user = this.authService.validateUser({username, password});
        if(!user) throw new ConflictException();
        return user;
    }
}