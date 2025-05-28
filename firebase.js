<<<<<<< HEAD
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "apikey",
    authDomain: "authenticationurl",
    databaseURL: "databaseurl",
    projectId: "pID",
    storageBucket: "storageBucket",
    messagingSenderId: "messagingSenderId",
    appId: "appId",
    measurementId: "measurementId"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication ve Firestore'u başlat
export const auth = getAuth(app);
export const db = getFirestore(app);
=======
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyA7sRlOh9XHjUOQxXieaIVAnzsftO23pqY",
//   authDomain: "bluesail-db036.firebaseapp.com",
//   projectId: "bluesail-db036",
//   storageBucket: "bluesail-db036.firebasestorage.app",
//   messagingSenderId: "790275984328",
//   appId: "1:790275984328:web:3b8f1a7e6f3f7640eb8efd",
//   measurementId: "G-207RWC8S2D"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// if (isSupported()) {
//     const analytics = getAnalytics(app);
//   }
>>>>>>> 1cb0f61753bad1140174d9777c72c9ea3969fc55
