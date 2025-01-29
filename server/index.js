const express = require('express');
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require("firebase/auth");
const { getFirestore, doc, setDoc, getDoc } = require("firebase/firestore");
const uuid = require('uuid-1345');
const crypto = require('crypto');

require('dotenv').config()

// Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


//Initialize HTTP Server
const app = express();
app.use(express.json());

//Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});


// #region Routes

//Eve online OAuth2 Callback route
app.get('/callback', async (request, response) => {

    const { code, state } = request.query;
    const authHeader = "Basic " + btoa(process.env.ESI_CLIENT_ID + ":" + process.env.ESI_CLIENT_SECRET);

    // Complete the OAuth2 flow
    const res = await fetch('https://login.eveonline.com/v2/oauth/token', {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/x-www-form-urlencoded', 'Host': 'login.eveonline.com' },
        body: new URLSearchParams({ grant_type: 'authorization_code', code: code })
    });



    // If the response is successful, send the success page and create a new user in Firebase
    if (res.status == 200) {
        //TODO: Make object orriented for authorization data
        const responseData = await res.json();
        const accessToken = responseData.access_token;
        const refreshToken = responseData.refresh_token;

        const charInfoRes = await fetch("https://esi.evetech.net/verify/?datasource=tranquility", {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        //TODO: Make object orriented for character data
        const characterData = await charInfoRes.json();
        const characterID = characterData.CharacterID;
        const characterName = characterData.CharacterName;

        // Calculate the expiration time
        const expiresIn = responseData.expires_in; // 20 minutes
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

        // Send the success page
        response.sendFile(__dirname + "/view/success.html");

        // Create a new user in Firebase
        const userID = generateUUID(state) + "@evecatalystdiscord.com";
        var password = generatePassword(state);

        const auth = getAuth();
        createUserWithEmailAndPassword(auth, userID, password)
            .then(async (userCredential) => {
                // Signed up 
                const user = userCredential.user;

                // Save the access token, refresh token, and expiration time in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    character_id: characterID,
                    character_name: characterName,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires: expiresAt
                });

                // Premptively sign out the user
                signOut(auth)
                    .then(() => {
                        console.log("User signed out");
                    }).catch((error) => {
                        console.log(error);
                    });

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode + ":" + errorMessage);

            });
    } else {
        //TODO: Log some error for me to investigate later

        response.sendFile(__dirname + "/view/error.html");
    }
});

//Firebase Login Route
app.get('/login', async (request, response) => {
    const { token } = request.query;

    const userID = generateUUID(token) + "@evecatalystdiscord.com";
    var password = generatePassword(token);

    const auth = getAuth();
    signInWithEmailAndPassword(auth, userID, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            response.send(user.toJSON());
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + ":" + errorMessage);
            response.status(404).send("No user found");
        });
});


app.get('/character', async (request, response) => {
    const { uid } = request.query;

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        response.send(data);
    } else {
        response.send("No such document!");
    }
});
// #endregion

// #region Utility Functions
function generateUUID(inputString) {
    return uuid.v5({ namespace: uuid.namespace.url, name: inputString });
}

function generatePassword(inputString) {
    return SHA256Hash(process.env.APP_SECRET + "_" + inputString) + "!";
}

function SHA256Hash(inputString) {
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
}
// #endregion