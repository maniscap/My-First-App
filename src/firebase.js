import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
const db = getFirestore(app); // This turns on the Database connection

export { db };