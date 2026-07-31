// Firebase project config — safe to commit (not a secret; access is controlled
// by Firestore Security Rules and Google Sign-In, not by hiding this object).
// Replace with the values from Firebase Console → Project settings → Your apps → Web app.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAlWVyWLkRoBA1aXB3piX7ImysC_gnAq90",
  authDomain: "tarot-3ed23.firebaseapp.com",
  projectId: "tarot-3ed23",
  storageBucket: "tarot-3ed23.firebasestorage.app",
  messagingSenderId: "489872288851",
  appId: "1:489872288851:web:953269023e8e16380d6aa6",
};

// The only Google accounts allowed into admin.html.
// Real enforcement is in firestore.rules — this list is for immediate UI feedback only.
window.ADMIN_ALLOWED_EMAILS = [
  "angelalarcon.aa@gmail.com",
  "anaislegonia@gmail.com",
  "arcanavivatarot@gmail.com",
];
