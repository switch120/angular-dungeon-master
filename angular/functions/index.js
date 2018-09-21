const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

let express = require('express');

const cors = require("cors");
const bodyParser = require('body-parser');

let proxy = require('http-proxy-middleware');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// body parser middleware
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// pass the express app to the HTTPS Trigger
exports.api = functions.https.onRequest(app);
