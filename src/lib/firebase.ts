
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFx91OPub0sY-OkV3Z8-acrGOYaa49-tk",
  authDomain: "shopstream-8f8e0.firebaseapp.com",
  projectId: "shopstream-8f8e0",
  storageBucket: "shopstream-8f8e0.firebasestorage.app",
  messagingSenderId: "121106110873",
  appId: "1:121106110873:web:a20bd6122a1df1aaf65b08"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
