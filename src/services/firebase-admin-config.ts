import admin from 'firebase-admin';

const serviceAccount = require('../config/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;