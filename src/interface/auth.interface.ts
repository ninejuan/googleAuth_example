interface Auth {
    slogId?: Number;
    slogNick?: String;
    providerData: {
        provider: String;
        email: String;
        name: String;
        uid?: String;
    };
    profilePhoto?: String;
    createdAt: Number;
    updatedAt: Number;
};

export default Auth;