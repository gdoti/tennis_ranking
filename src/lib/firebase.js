import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdzHEZdhd9vpS6X-oCoLx5ctBrSlPhAP8",
  authDomain: "tenniscircle-dd74f.firebaseapp.com",
  projectId: "tenniscircle-dd74f",
  storageBucket: "tenniscircle-dd74f.firebasestorage.app",
  messagingSenderId: "194862739724",
  appId: "1:194862739724:web:411e614efb61b232c11929",
  measurementId: "G-XNCLP1Y6C6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
