// constants/firebaseConfig.ts
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBLdMGhSdxZrX_yQ764FySno0Jm1z_pUCo",
  authDomain: "my-portfolio-7a56d.firebaseapp.com",
  projectId: "my-portfolio-7a56d",
  storageBucket: "my-portfolio-7a56d.firebasestorage.app",
  messagingSenderId: "348925726056",
  appId: "1:348925726056:web:626684e75cf03abd4b9add",
  measurementId: "G-3GXVRVZK41"
};


// prevent re-initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
