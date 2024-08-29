import mongo from 'mongoose';

const userSchema = new mongo.Schema({
    google_mail: { type: String, required: true },
    nickname: { type: String, required: true },
    description: { type: String, default: "" },
    associated: { type: String, default: "" },
    profilePhoto: { type: String, default: "default.png" }, // 저장된 파일명
    refreshToken: { type: String, default: "" },
});

export default mongo.model('user_data', userSchema);