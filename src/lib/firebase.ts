// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "qoro-iy1gs",
  "appId": "1:62039220673:web:c357a855b1093c508f8f40",
  "storageBucket": "qoro-iy1gs.firebasestorage.app",
  "apiKey": "AIzaSyB-v1ynnLnRuIV4-VTJhBtXPPkHpg-ivtU",
  "authDomain": "qoro-iy1gs.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "62039220673"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
