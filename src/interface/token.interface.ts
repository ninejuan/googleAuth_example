interface Token {
    slogId: Number;
    token: String;
    providerData: {
        provider: String;
        refToken: String;
        acToken: String;
    };
};

export default Token;