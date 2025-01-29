const express = require('express');
const router = require('./routes.js');
require('dotenv').config()


function run() {
    app = express();
    app.use(express.json());
    app.use(router);
    app.listen(process.env.PORT, () => {
        console.log("Server Listening on PORT:", process.env.PORT);
    });


}

module.exports = { run };