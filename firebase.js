import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhlPZ3ld6WyYg2_NX35aGK0Hxh60e-VFw",
  authDomain: "mynotes-6a857.firebaseapp.com",
  projectId: "mynotes-6a857",
  storageBucket: "mynotes-6a857.firebasestorage.app",
  messagingSenderId: "776176539117",
  appId: "1:776176539117:web:16af982eadfec7d03d43e4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
