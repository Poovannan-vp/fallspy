// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsLF1uj37ROXLwveQ0oMRYjcDs5rL9OJs",
    authDomain: "fallspy-62a71.firebaseapp.com",
    projectId: "fallspy-62a71",
    storageBucket: "fallspy-62a71.appspot.com", // Fixed Typo
    messagingSenderId: "834561987863",
    appId: "1:834561987863:web:408716915cecc857b95352",
    measurementId: "G-FVE7K0KXM3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const realtimeDb = firebase.database();

window.auth = auth;
window.db = db;
window.realtimeDb = realtimeDb;


// Debugging Firebase Initialization
console.log("Firebase Initialized:", firebase);
console.log("Firestore DB:", db);

// Expose Firebase objects globally
window.auth = auth;
window.db = db;
window.realtimeDb = realtimeDb;
