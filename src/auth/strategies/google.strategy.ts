import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CB_URL,
            scope: ['profile', 'email']
        })
    }
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        console.log('...Creating user')
        const {emails: [{value: email}], } = profile
        const user = await this.authService.findUserByEmail(email);
        console.log({user})
        if(user) return done(null, user);
        const userCreated = await this.authService.createUser({
            email: email,
            displayName: profile.displayName,
            profile_pic: profile.photos[0].value
        });
        console.log({userCreated})
        return done(null, userCreated);
        // console.log({accessToken, refreshToken, profile})
        // return profile
    }
}