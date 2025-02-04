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

    static generateEmail(inputString) {
        return this.generateUUID(inputString) + "@evecatalystdiscord.com";
    }

    // Get the user's generated email and password from the discord interaction
    static async getDiscordUserData(interaction) {
        const guildID = interaction.guild.id;
        const owner = await interaction.guild.fetchOwner();
        const userData = btoa(guildID + ":" + owner.user.tag + ":" + owner.user.id);

        return { email: this.generateEmail(userData), password: this.generatePassword(userData), owner: owner, guildID: guildID, token: userData };
    }
}

module.exports = { Utility };