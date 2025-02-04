import('chai').then(chai => { expect = chai.expect; });
const { Firestore } = require("../src/database/firestore-database.js");
require('dotenv').config()

describe("Integration testing the functions of Firebase Authentication.", () => {
    const firestore = new Firestore();
    const email = "test@test.com";
    const password = "testpassword";

    it("should create a new user", async () => {
        const result = await firestore.createUser(email, password, { created: new Date() });
        expect(result.success).to.be.true;
        expect(result.value).to.not.be.null;
        expect(result.value.email).to.equal(email);
        
    });

    it("should sign in the user", async () => {
        const user = await firestore.signIn(email, password);
        expect(user.success).to.be.true;
        expect(user.value).to.not.be.null;
    });

    it("should sign out the user", async () => {
        const result = await firestore.signOut();
        expect(result.success).to.be.true;
    });

    it("should delete the user", async () => {
        const result = await firestore.deleteUser(email, password);
        expect(result.success).to.be.true;
        expect(await firestore.doesUserExist(email)).to.be.false;

        await firestore.signIn(email, password);
        const user = await firestore.getAuth().currentUser;
        await user.delete()
    });

});