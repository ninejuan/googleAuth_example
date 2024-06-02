import mongo from 'mongoose';

const usersubSchema = new mongo.Schema({
    articleId: { type: Number, required: true }
})

const userArticleSchema = new mongo.Schema({
    slogId: { type: String, required: true },
    userContent: [ usersubSchema ] // 사용자가 가지고 있는 글의 Id들
    // userContent는 백엔드 단에서 값 수정 시 position 0으로 unshift 삽입
});

export default mongo.model('user_article', userArticleSchema);