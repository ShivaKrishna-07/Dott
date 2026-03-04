import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyAEa31GXnPx_Gugc5bVhJ_Xj3BJPB2bY",
  authDomain: "habit-tracker-2b772.firebaseapp.com",
  projectId: "habit-tracker-2b772",
  storageBucket: "habit-tracker-2b772.firebasestorage.app",
  messagingSenderId: "464557528865",
  appId: "1:464557528865:web:99042d6c6a3aff45121060",
  measurementId: "G-15ZH30SBHB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
