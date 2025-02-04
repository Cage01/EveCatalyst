import('chai').then(chai => { expect = chai.expect; });
const { Utility } = require('../src/utility');

describe('Unit testing the Utility class', () => {
    it('should generate a valid UUID', () => {
        const inputString = 'test';
        const uuid = Utility.generateUUID(inputString);
        expect(uuid).to.be.a('string');
        expect(uuid).to.have.length(36);

        const uuid2 = Utility.generateUUID(inputString);
        expect(uuid2).to.be.a('string');
        expect(uuid2).to.have.length(36);
        expect(uuid).to.equal(uuid2);
    });

    it('should generate a valid password', () => {
        const inputString = 'test';
        const password = Utility.generatePassword(inputString);
        expect(password).to.be.a('string');
    });

    it('should generate a valid SHA256 hash', () => {
        const inputString = 'test';
        const hash = Utility.SHA256Hash(inputString);
        expect(hash).to.be.a('string');
        expect(hash).to.have.length(64);
    });

    it('should generate a valid email', () => {
        const inputString = 'test';
        const email = Utility.generateEmail(inputString);
        expect(email).to.be.a('string');
        expect(email).to.match(/^[a-f0-9-]{36}@evecatalystdiscord\.com$/);
    });

    it('should get Discord user data', async () => {
        const interaction = {
            guild: {
                id: '1234567890',
                fetchOwner: async () => ({
                    user: {
                        tag: 'owner#1234',
                        id: '0987654321'
                    }
                })
            }
        };
        const userData = await Utility.getDiscordUserData(interaction);
        expect(userData).to.have.property('email');
        expect(userData).to.have.property('password');
        expect(userData).to.have.property('owner');
        expect(userData).to.have.property('guildID');
        expect(userData).to.have.property('token');
    });
});

