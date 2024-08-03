import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBnjpnUvpCYeWzf5kQf6iFER7PsZmqHkK4",
  authDomain: "pl-predictions-2f98f.firebaseapp.com",
  projectId: "pl-predictions-2f98f",
  storageBucket: "pl-predictions-2f98f.appspot.com",
  messagingSenderId: "1002066223624",
  appId: "1:1002066223624:web:ca71b45969aebd5bd927bd",
  measurementId: "G-YBKR7YB3WC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
