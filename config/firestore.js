const admin = require('firebase-admin');
var serviceAccount = require('../config/learn-371c9-firebase-adminsdk-96ix3-6f8ad48601.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    const settings = { timestampsInSnapshots: true };
    admin.firestore().settings(settings);
}

// set the params
var db = admin.firestore();


module.exports.db = db;