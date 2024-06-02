import mongo from 'mongoose';
import userSchema from '../models/auth.schema';
import * as crypto from 'crypto';

async function genId() {
    const fgen = await crypto.randomInt(10000000, 99999999);
    const user = await userSchema.findOne({
        slogId: fgen
    });
    return (!user) ? fgen : await genId();
}
export default genId;