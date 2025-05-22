import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 1. Defina o firebaseConfig primeiro!
const firebaseConfig = {
  apiKey: "AIzaSyBtmhJ0fNx3j4Z6MPPaa220HemYMUlZBzQ",
  authDomain: "contratoclar0.firebaseapp.com",
  projectId: "contratoclar0",
  storageBucket: "contratoclar0.firebasestorage.app",
  messagingSenderId: "647412189368",
  appId: "1:647412189368:web:4e6deddbfe894654d64c4d",
  measurementId: "G-QETNFJ6B3L"
  // ...suas configs
};

// 2. Inicialize o app
const app = initializeApp(firebaseConfig);

// 3. Exporte o auth, db e storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);