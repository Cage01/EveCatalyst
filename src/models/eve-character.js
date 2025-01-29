class EveCharacter {
    constructor(data) {
        this.characterID = data.CharacterID;
        this.characterName = data.CharacterName;
        this.expiresOn = new Date(data.ExpiresOn);
        this.scopes = data.Scopes.split(' ');
        this.tokenType = data.TokenType;
        this.characterOwnerHash = data.CharacterOwnerHash;
        this.clientID = data.ClientID;
    }

    isTokenExpired() {
        return new Date() > this.expiresOn;
    }

    getScopes() {
        return this.scopes;
    }

    toJSON() {
        return {
            CharacterID: this.characterID,
            CharacterName: this.characterName,
            ExpiresOn: this.expiresOn.toISOString(),
            Scopes: this.scopes.join(' '),
            TokenType: this.tokenType,
            CharacterOwnerHash: this.characterOwnerHash,
            ClientID: this.clientID
        };
    }
}

module.exports = { EveCharacter };