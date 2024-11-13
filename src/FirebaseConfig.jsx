// FirebaseConfig.jsx
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoyaA8kYMIzZpsghrn6vqWerPIYcHy4MM",
  authDomain: "cartify-2f4de.firebaseapp.com",
  databaseURL: "https://cartify-2f4de-default-rtdb.firebaseio.com",
  projectId: "cartify-2f4de",
  storageBucket: "cartify-2f4de.appspot.com",
  messagingSenderId: "650061789794",
  appId: "1:650061789794:web:b02e968056632d70e5ef3b",
  measurementId: "G-RX51VEH0NW",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };
