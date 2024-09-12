/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../../auth/auth.service";

const env = process.env;

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${env.HTTP_PROTOCOL}://${env.DOMAIN}${env.GOOGLE_CALLBACK_PARAM}`,
            scope: ['profile', 'email']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        console.log(accessToken, refreshToken, profile, done);
        const email = profile._json.email;
        const user = await this.authService.findUserByEmail(email);
        if (user) return done(null, user);
        const userCreated = await this.authService.createUser({
            google_mail: email,
            google_uid: profile.id,
            name: profile._json.name,
            profilePhoto: profile.photos[0].value
        });
        return done(null, userCreated);
    }
}