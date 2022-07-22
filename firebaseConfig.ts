import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjJKW5_P7UezHBana1sQaHwkUKNGxvJRw",
  authDomain: "nghien-722ef.firebaseapp.com",
  projectId: "nghien-722ef",
  storageBucket: "nghien-722ef.appspot.com",
  messagingSenderId: "253481935770",
  appId: "1:253481935770:web:ba1bed343d9d4bb0605023",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
