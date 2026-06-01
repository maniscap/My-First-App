import { initializeApp } from "firebase/app";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBihGrldzMMvNE8-iy5DUrbwKX7Q3EBB20",
  authDomain: "farmcap-1e1c9.firebaseapp.com",
  projectId: "farmcap-1e1c9",
  storageBucket: "farmcap-1e1c9.firebasestorage.app",
  messagingSenderId: "967937745226",
  appId: "1:967937745226:web:e75bec37ce8c8e6f8161b3",
  measurementId: "G-3L79Q2FHTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL FIX: Bypass the persistent IndexedDB cache to prevent "BloomFilterError"
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

const auth = getAuth(app); 
const googleProvider = new GoogleAuthProvider(); 

export { db, auth, googleProvider };