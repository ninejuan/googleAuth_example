import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import authSchema from 'src/models/auth.schema';
import tokenSchema from '../../../models/token.schema';
import tokenDataSchema from 'src/models/tokendata.schema';
import Auth from 'src/interface/auth.interface';
import Token from 'src/interface/token.interface';
import tokenData from 'src/interface/tokenData.interface';
import genIdUtil from 'src/utils/genId.util';
import genTknUtil from 'src/utils/genTkn.util';
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

    // authorizationParams(): { [key: string]: string; } {
    //     return ({
    //         access_type: 'offline'
    //     });
    // };

    private async delToken(slogId: Number) {
        await tokenDataSchema.deleteMany({
            slogId: slogId
        });
        await tokenSchema.deleteMany({
            slogId: slogId
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const user = await authSchema.findOne({
            providerData: {
                email: profile._json.email,
                name: profile.displayName,
                uid: profile.id,
            }
        });
        try {
            let slogId: Number; let regTkn: Token; let newTkn: tokenData;
            if (!user) { // 등록된 사용자 계정이 없는 경우 - 등록 & 토큰 발급
                slogId = await genIdUtil();
                const newAcc: Auth = {
                    slogId: slogId,
                    slogNick: profile.displayName,
                    providerData: {
                        email: profile._json.email,
                        name: profile.displayName,
                        uid: profile.id
                    },
                    profilePhoto: profile._json.picture.replace(/sz=50/gi, 'sz=250'),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
                await new authSchema(newAcc).save();
                let Tkn = await genTknUtil();
                newTkn = {
                    slogId: slogId,
                    token: Tkn,
                    providerData: {
                        refToken: refreshToken ?? "none",
                        acToken: accessToken
                    }
                };
                regTkn = {
                    slogId: slogId,
                    token: Tkn
                }
                await new tokenSchema(regTkn).save();
                await new tokenDataSchema(newTkn).save();
                done(null, regTkn);
            } else { // 등록된 사용자 계정이 있는 경우 - 토큰 업데이트
                slogId = user.slogId;
                console.log('slogId'+slogId);
                const existToken = await tokenDataSchema.findOne({
                    slogId: slogId
                });
                console.log('ext'+existToken);
                if (refreshToken) { // 기존 토큰이 모종의 이유로 인해 만료된 경우 or refreshToken이 업데이트된 경우
                    this.delToken(slogId);
                    let Tkn = await genTknUtil();
                    newTkn = {
                        slogId: slogId,
                        token: Tkn,
                        providerData: {
                            refToken: refreshToken ?? "none",
                            acToken: accessToken
                        }
                    };
                    regTkn = {
                        slogId: slogId,
                        token: Tkn
                    }
                    await new tokenSchema(regTkn).save();
                    await new tokenDataSchema(newTkn).save();
                    done(null, regTkn);
                }
                else { // acToken 업데이트만 진행
                    existToken.providerData.acToken = accessToken;
                    await existToken.save();
                    done(null, {
                        slogId: slogId,
                        token: existToken.token
                    });
                }
            }
        } catch (err) {
            console.error(err);
            done(err, false);
        }
    }
}