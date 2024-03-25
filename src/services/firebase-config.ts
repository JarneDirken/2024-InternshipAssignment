// firebase-config.js or firebase-config.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyC65KlTaBR0cT-RNSv4OvTRw0hovd1AITc",
    authDomain: "internshipassignment-c6d15.firebaseapp.com",
    projectId: "internshipassignment-c6d15",
    storageBucket: "internshipassignment-c6d15.appspot.com",
    messagingSenderId: "924731255763",
    appId: "1:924731255763:web:4c2251eaba8369478f9d26"
};

// Initialize Firebase only if there are no initialized apps
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp(); // if already initialized, use that one
}

export default app;
