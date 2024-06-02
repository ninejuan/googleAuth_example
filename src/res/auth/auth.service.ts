import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import tokenSchema from 'src/models/token.schema';
import authSchema from 'src/models/auth.schema';
import Auth from 'src/interface/auth.interface';
import tokenData from 'src/interface/tokenData.interface';
import Token from 'src/interface/token.interface';

/**
 * response code
 * 0 : normal
 * 1 : error
 */

@Injectable()
export class AuthService {
    async deleteUser(slogId: Number, provider: string, email: string, uid: string) { // DELETE Method
        await authSchema.deleteOne({
            slogId: slogId,
            providerData: {
                provider: provider,
                email: email,
                uid: uid
            }
        }).then(() => {
            return 0;
        }).catch((e) => {
            throw new Error(e);
        })
    }
}
    