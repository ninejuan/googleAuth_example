import tokenSchema from "src/models/token.schema";
import * as crypto from 'crypto';

async function genTkn() { // make User Token (BE -> FE)
    const fgen = crypto.randomUUID();
    const vTkn = await tokenSchema.findOne({
        token: fgen
    });
    return (!vTkn) ? fgen : this.genTkn()
}

export default genTkn;