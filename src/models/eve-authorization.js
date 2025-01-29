class EveAuthorization {
    constructor(data) {
        this.accessToken = data.access_token;
        this.expiresIn = data.expires_in;
        this.refreshToken = data.refresh_token;
        this.tokenType = data.token_type;
    }
}

module.exports = { EveAuthorization };
