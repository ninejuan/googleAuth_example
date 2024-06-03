import mongo from 'mongoose';

const tokenDataSchema = new mongo.Schema({
    slogId: { type: Number, required: true },
    token: { type: String, required: true }
})

export default mongo.model('token', tokenDataSchema);