import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7V38-QnMmJqulc2L5TLn35-U9PcLYyxQ",
  authDomain: "assessment-272f8.firebaseapp.com",
  projectId: "assessment-272f8",
  storageBucket: "assessment-272f8.firebasestorage.app",
  messagingSenderId: "73781130360",
  appId: "1:73781130360:web:6a6e2684f96019a7d6a98d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };


