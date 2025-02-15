// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdJVYygMCNmDidbBkcqCM8VwGNLKKsefM",
    authDomain: "quiz-app-5026a.firebaseapp.com",
    projectId: "quiz-app-5026a",
    storageBucket: "quiz-app-5026a.appspot.com",
    messagingSenderId: "468338221142",
    appId: "1:468338221142:web:5a7a4fd7e0fa32b43cdbf7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

export { auth, provider, db };
