import mongo from 'mongoose';

const tokenDataSchema = new mongo.Schema({
    slogId: { type: Number, required: true },
    token: { type: String, required: true }
}, {
    expireAfterSeconds: 1000 * 60 * 60 * 24 * 7
})

export default mongo.model('token_data', tokenDataSchema);