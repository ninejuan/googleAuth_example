import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import authSchema from 'src/models/auth.schema';
import tokenSchema from 'src/models/token.schema';
import tokenDataSchema from 'src/models/tokendata.schema';
import Auth from 'src/interface/auth.interface';
import Token from 'src/interface/token.interface';
import tokenData from 'src/interface/tokenData.interface';
import genIdUtil from 'src/utils/genId.util';
import genTknUtil from 'src/utils/genTkn.util';
import { access } from 'fs';
config();

const env = process.env;

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${env.HTTP_PROTOCOL}://${env.DOMAIN}${env.GOOGLE_REDIRECT_PARAM}`,
            scope: ['profile', 'email']
        });
    }

    authorizationParams(): { [key: string]: string; } {
        return ({
          access_type: 'offline'
        });
      };

    // async validate(act, reft, pf, dn) {
    //     console.log(pf);
    //     dn(null, pf);
    // }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        console.log(`strategy - refTkn - ${refreshToken}`)
        const user = await authSchema.findOne({
            providerData: {
                provider: profile.provider,
                email: profile._json.email,
                name: profile.displayName,
                uid: profile.id,
            }
        });
        try {
            let slogId: Number;
            if (user) {
                slogId = user.slogId;
                await tokenSchema.findOneAndDelete({
                    slogId: user.slogId
                });
                if (user.providerData.name !== profile.displayName || user.profilePhoto !== profile._json.picture.replace(/sz=50/gi, 'sz=250')) {
                    user.providerData.name = profile.displayName;
                    user.profilePhoto = profile._json.picture.replace(/sz=50/gi, 'sz=250');
                    await user.save();
                }
            } else {
                slogId = await genIdUtil();
                const newAcc: Auth = {
                    slogId: slogId,
                    slogNick: profile.displayName,
                    providerData: {
                        provider: profile.provider,
                        email: profile._json.email,
                        name: profile.displayName,
                        uid: profile.id
                    },
                    profilePhoto: profile._json.picture.replace(/sz=50/gi, 'sz=250'),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
                await new authSchema(newAcc).save();
            }
            let Tkn = await genTknUtil();
            const newTkn: Token = {
                slogId: slogId,
                token: Tkn,
                providerData: {
                    provider: profile.provider,
                    refToken: refreshToken ?? "none",
                    acToken: accessToken
                }
            };
            const regTkn: tokenData = {
                slogId: slogId,
                token: Tkn
            }
            await new tokenSchema(newTkn).save();
            await new tokenDataSchema(regTkn).save();
            done(null, regTkn);
        } catch (err) {
            console.error(err);
            done(err, false);
        }
    }
}