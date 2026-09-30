import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmVJSNy5GTcSIvQgja760HAuQRXdcbE_M",
  authDomain: "agoin-registro-de-jornada.firebaseapp.com",
  projectId: "agoin-registro-de-jornada",
  storageBucket: "agoin-registro-de-jornada.firebasestorage.app",
  messagingSenderId: "61121167825",
  appId: "1:61121167825:web:46b4798e32a942a4c7e0f0",
  measurementId: "G-3KG185V0HL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
