import mongo from 'mongoose';

const commentSchema = new mongo.Schema({
    ownerId: { type: String, required: true },
    content: { type: String, required: true },
    writeTime: { type: Date, required: true }
});

const imageSchema = new mongo.Schema({
    imgDir: { type: String, required: true }
});

const articleSchema = new mongo.Schema({
    title: { type: String },
    content: { type: String },
    images: [ imageSchema ],
    comments: [ commentSchema ]
});

export default mongo.model('article', articleSchema);

// 이거 url별로 할당해야 하는 터라 종류 수정 고려