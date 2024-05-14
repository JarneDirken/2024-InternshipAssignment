import admin from 'firebase-admin';

const serviceJsonFile = process.env.SERVICE_JSON_FILE;
if (!serviceJsonFile) {
    throw new Error('The SERVICE_JSON_FILE environment variable is not set.');
}

const secretJSON = JSON.parse(serviceJsonFile);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(secretJSON),
    });
}

export default admin;