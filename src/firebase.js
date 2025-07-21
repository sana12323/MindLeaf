// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKQbCeHltCpZI1vW8TZZrUmXJAtup4wOI",
  authDomain: "mindleaf-3647e.firebaseapp.com",
  projectId: "mindleaf-3647e",
  storageBucket: "mindleaf-3647e.firebasestorage.app",
  messagingSenderId: "699813733399",
  appId: "1:699813733399:web:bd3c58f4d4a513b8782852",
  measurementId: "G-Q3JQ1Q7H4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);