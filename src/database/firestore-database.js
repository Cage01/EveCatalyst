const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence } = require("firebase/auth");
const { getFirestore, doc, setDoc, getDoc, deleteDoc, updateDoc } = require("firebase/firestore");


//TODO: May need to write a queue system to handle multiple requests, since only one user can be signed in at a time
//TODO: Also consider having firestore run on its own thread, spawning a new thread for each request and then killing it after the request is done
class Firestore {
    constructor() {
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        this.db = getFirestore(app);

        this.auth = getAuth(app);
        setPersistence(this.auth, 'none');


    }

    getAuth() {
        return this.auth;
    }

    async doesUserExist(email) {
        const docSnap = await this.getDoc("users_public", email);
        return docSnap.exists();
    }

    async getUser(userID) {
        const docSnap = await this.getDoc("users", userID);
        if (docSnap.exists()) {
            return { success: true, value: docSnap.data() };
        }

        return { success: false, error: "User does not exist" };
    }

    async createUser(email, password, data) {
        try {
            var user = null;
            try {
                user = (await createUserWithEmailAndPassword(this.auth, email, password)).user;
            } catch (error) {
                console.log(error);
                user = (await this.signIn(email, password)).value.user;
            }


            //Add the user to the users and users_public collections
            await this.setDoc("users", user.uid, data);
            await this.setDoc("users_public", email, { created: new Date() });

            await this.signOut();

            return { success: true, value: user };
        } catch (error) {
            //console.log("Error creating user \n " + error.stack);
            return { success: false, error: error };
        }

    }

    async deleteUser(email, password) {
        try {
            var credential = await this.signIn(email, password);

            if (credential.success) {
                await deleteDoc(doc(this.db, "users", credential.value.user.uid));
                await deleteDoc(doc(this.db, "users_public", email));

                //console.log("User deleted: " + email);

                await this.signOut();
                return { success: true };
            }

            return { success: false, error: "User does not exist" };
        } catch (error) {
            //console.log("Error deleting user \n" + error.stack);
            return { success: false, error: error };
        }
    }

    //TODO: If the account exists, but there are no entries in the users collection of the database, then request the user to re-authenticate
    async signIn(email, password) {
        try {
            const user = await signInWithEmailAndPassword(this.auth, email, password);
            return { success: true, value: user };
        } catch (error) {
            return { success: false, error: error };
        }
    }

    async signOut() {
        try {
            await signOut(this.auth);
            //console.log("User signed out");
            return { success: true };
        } catch (error) {
            //console.log("Error signing out \n" + error);
            return { success: false, error: error };
        }
    }

    async isSetupComplete(userID) {
        const docSnap = await this.getDoc("users", userID);
        if (docSnap.exists()) {
            if (docSnap.data().setup_complete != undefined) {
                return docSnap.data().setup_complete;
            }
        }

        return false;
    }


    /* 
    *  @param {string} collection - The collection to set the document in (users)
    *  @param {string} docID - The document ID to set (The user ID)
    *  @param {Object} data - The data to set (Comes in the form of a JSON object)
    */
    async setDoc(collection, docID, data) {
        //TODO: Sign in user, run this function, then sign out
        return await setDoc(doc(this.db, collection, docID), data);
    }

    /* 
    *  @param {string} collection - The collection to set the document in (users)
    *  @param {string} docID - The document ID to set (The user ID)
    *  @param {Object} data - The data to set (Comes in the form of a JSON object)
    */
    async updateDoc(collection, docID, data) {
        return await updateDoc(doc(this.db, collection, docID), data);
    }

    /* 
    *  @param {string} collection - The collection to get the document from (users)
    *  @param {string} docID - The document ID to get (The user ID)
    */
    async getDoc(collection, docID) {
        return await getDoc(doc(this.db, collection, docID));
    }
}

module.exports = { Firestore };