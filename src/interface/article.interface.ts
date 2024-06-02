interface Article {
    title?: String;
    content?: String;
    images: [
        {
            imgDir: String
        }
    ];
    comments: [
        {
            ownerId: String;
            content: String;
            writeTime: Date;
        }
    ];
};

export default Article;