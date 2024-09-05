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
        const { emails: [{ value: email }], } = profile
        const user = await this.authService.findUserByEmail(email);
        console.log({ user })
        if (user) return done(null, user);
        const userCreated = await this.authService.createUser({
            google_mail: email,
            google_uid: ``,
            name: profile.displayName,
            profilePhoto: profile.photos[0].value
        });
        console.log({ userCreated })
        return done(null, userCreated);
    }
}