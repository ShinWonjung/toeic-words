import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAS_jGOfvCp8lM9hwqfsSx9ktW59-LTWgI",
  authDomain: "toeic-words-28d6f.firebaseapp.com",
  projectId: "toeic-words-28d6f",
  storageBucket: "toeic-words-28d6f.firebasestorage.app",
  messagingSenderId: "372944395895",
  appId: "1:372944395895:web:b31e233204dd90516b7072"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
