const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require("firebase/auth");
const { getFirestore, doc, setDoc, getDoc } = require("firebase/firestore");

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
        this.auth = getAuth(app);
        this.db = getFirestore(app);
    }

    async createUser(userID, password) {
        return await createUserWithEmailAndPassword(this.auth, userID, password);
    }

    async signIn(userID, password) {
        return await signInWithEmailAndPassword(this.auth, userID, password);
    }

    async signOut() {
        return await signOut(this.auth);
    }

    /* 
    *  @param {string} collection - The collection to set the document in (users)
    *  @param {string} docID - The document ID to set (The user ID)
    *  @param {Object} data - The data to set (Comes in the form of a JSON object)
    */
    async setDoc(collection, docID, data) {
        return await setDoc(doc(this.db, collection, docID), data);
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