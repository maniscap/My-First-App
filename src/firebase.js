import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, memoryLocalCache, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth"; 
import { getStorage } from "firebase/storage"; 

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

// Initialize Firebase (Safely for Vite Hot Reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL FIX: Bypass the persistent IndexedDB cache to prevent "BloomFilterError"
// We use a try/catch block because Vite's Hot Reload will try to run this code twice.
let db;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
} catch (error) {
  // If it throws an error during Hot Reload, just get the already initialized instance
  db = getFirestore(app);
}

const auth = getAuth(app); 
setPersistence(auth, browserLocalPersistence)
  .catch((error) => console.error("Error setting Firebase Auth persistence:", error));

const googleProvider = new GoogleAuthProvider(); 
const storage = getStorage(app);

export { db, auth, googleProvider, storage };