const uuid = require('uuid-1345');
const crypto = require('crypto');

class Utility {
    static generateUUID(inputString) {
        return uuid.v5({ namespace: uuid.namespace.url, name: inputString });
    }

    static generatePassword(inputString) {
        return this.SHA256Hash(process.env.APP_SECRET + "_" + inputString) + "!";
    }

    static SHA256Hash(inputString) {
        const hash = crypto.createHash('sha256');
        hash.update(inputString);
        return hash.digest('hex');
    }
}

module.exports = { Utility };