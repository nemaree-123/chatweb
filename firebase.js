// firebase.js
// Place this file in the same folder as your HTML files.
// Replace firebaseConfig with your project's config object.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getDatabase, ref as rtdbRef, onDisconnect, set as rtdbSet, onValue as rtdbOnValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "YOUR_DATABASE_URL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// ---- Helper functions ----

// Create a user with a username (we create a fake email using the username)
async function signupWithUsername(firstName, lastName, username, password) {
  const email = `${username}@chatverse.local`; // fake-but-unique email
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  // update displayName
  await updateProfile(user, { displayName: `${firstName} ${lastName}` });
  // Save to Firestore users collection
  const userDoc = doc(db, "users", user.uid);
  await setDoc(userDoc, {
    uid: user.uid,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    username,
    createdAt: serverTimestamp(),
    photoURL: null
  });
  return user;
}

async function signInWithUsername(username, password) {
  const email = `${username}@chatverse.local`;
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function signOutUser() {
  await signOut(auth);
}

// Presence (Realtime Database)
function setPresence(uid) {
  if (!uid) return;
  const statusRef = rtdbRef(rtdb, `status/${uid}`);
  // set online
  rtdbSet(statusRef, { state: "online", last_changed: Date.now() });
  // on disconnect set offline
  onDisconnect(statusRef).set({ state: "offline", last_changed: Date.now() });
}

function onPresenceChange(uid, cb) {
  const statusRef = rtdbRef(rtdb, `status/${uid}`);
  rtdbOnValue(statusRef, snapshot => {
    cb(snapshot.val());
  });
}

export {
  auth, db, rtdb,
  signupWithUsername, signInWithUsername, signOutUser,
  onAuthStateChanged, doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit,
  setPresence, onPresenceChange
};
