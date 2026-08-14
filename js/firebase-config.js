// js/firebase-config.js
const firebaseConfig = {
  apiKey: 'AIzaSyCGRQ9G9l65_wJV0nuXTsyG2_e3k5M6scM',
  authDomain: 'energypulse-680db.firebaseapp.com',
  projectId: 'energypulse-680db',
  storageBucket: 'energypulse-680db.firebasestorage.app',
  messagingSenderId: '1059657390641',
  appId: '1:1059657390641:web:9b0bc59cea632dace59310'
};

// Firebase configuration for EnergyPulse project

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
