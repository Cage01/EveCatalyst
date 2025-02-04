const { Router } = require('express');
const { Utility } = require('../utility.js');
const { Firestore } = require('../database/firestore-database.js');
const { EveCharacter, EveAuthorization } = require('../models/init.js');

const router = Router();

//Eve online OAuth2 Callback route
router.get('/callback', async (request, response) => {

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
        const responseData = new EveAuthorization(await res.json());

        const charInfoRes = await fetch("https://esi.evetech.net/verify/?datasource=tranquility", {
            headers: { 'Authorization': 'Bearer ' + responseData.accessToken }
        });

        const characterData = new EveCharacter(await charInfoRes.json());

        // Calculate the expiration time
        const expiresIn = responseData.expiresIn; // 20 minutes
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

        // Create a new user in Firebase
        const newEmail = Utility.generateEmail(state);
        var newPassword = Utility.generatePassword(state);

        const firestore = new Firestore();

        const result = await firestore.createUser(newEmail, newPassword, {
            character_id: characterData.characterID,
            character_name: characterData.characterName,
            access_token: responseData.accessToken,
            refresh_token: responseData.refreshToken,
            expires: expiresAt
        });

        if (result.success) {
            // Send the success page
            response.sendFile(__dirname + "/view/success.html");
        } else {
            // Send the error page
            response.sendFile(__dirname + "/view/error.html");
        }

    } else {
        //TODO: Log some error for me to investigate later

        response.sendFile(__dirname + "/view/error.html");
    }
});

router.get('/ping', (request, response) => {
    response.send('pong');
});

module.exports = router;