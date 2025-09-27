// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA_apc8tgBj7W_Pmk4TOmN_QV4sUIYPCTk",
    authDomain: "hackverse-43bf5.firebaseapp.com",
    databaseURL: "https://hackverse-43bf5-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hackverse-43bf5",
    storageBucket: "hackverse-43bf5.firebasestorage.app",
    messagingSenderId: "971424769051",
    appId: "1:971424769051:web:f7224dd08a1bc263f544be",
    measurementId: "G-40V9LJE0XY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);