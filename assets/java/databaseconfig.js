import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxwEVRlrKtBfttKYwwcSoM2RNZMzqR4CQ",
  authDomain: "npd99-10ed5.firebaseapp.com",
  projectId: "npd99-10ed5",
  storageBucket: "npd99-10ed5.firebasestorage.app",
  messagingSenderId: "349629129784",
  appId: "1:349629129784:web:afaeb5fb148a64a5eeb2cd",
  measurementId: "G-FQM9D5P1DZ",
};

const app = initializeApp(firebaseConfig);
console.log(app.name);
export { app };
