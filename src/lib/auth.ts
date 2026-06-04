import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, Firestore } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { AppUser } from "@/types";

const googleProvider = new GoogleAuthProvider();


function getFirebaseAuth() {
  if (!auth) {
    throw new Error("Firebase auth has not been initialized.");
  }
  return auth;
}

function getFirestoreDB() {
  if (!db) {
    throw new Error("Firestore has not been initialized.");
  }
  return db;
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return result.user;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
  const user = result.user;

  // Create user document if first login
  const userRef = doc(getFirestoreDB(), "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      phone: "",
      role: "customer",
      addresses: [],
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
  phone = "",
  workshopName = "",
  workshopAddress = ""
) {
  const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  const user = result.user;

  // Update display name in Firebase Auth
  await updateProfile(user, { displayName: name });

  // Create user document in Firestore
  const role: AppUser["role"] = email === "admin@romalaser.com" ? "admin" : "customer";
  await setDoc(doc(getFirestoreDB(), "users", user.uid), {
    uid: user.uid,
    name,
    email,
    phone,
    workshopName,
    workshopAddress,
    role,
    addresses: [],
    createdAt: serverTimestamp(),
  });

  return user;
}

// ─── Create Staff (Admin Only) ───────────────────────────────────────────────

export async function createStaffMember(
  name: string,
  email: string,
  password: string,
  role: string
) {
  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth, createUserWithEmailAndPassword, signOut: secondarySignOut } = await import("firebase/auth");
  
  const apps = getApps();
  const primaryApp = apps[0];
  const secondaryAppName = "SecondaryAppForCreation";
  
  let secondaryApp = apps.find(app => app.name === secondaryAppName);
  if (!secondaryApp) {
    secondaryApp = initializeApp(primaryApp.options, secondaryAppName);
  }
  
  const secondaryAuth = getAuth(secondaryApp);
  const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const newUser = result.user;
  
  await secondarySignOut(secondaryAuth);
  
  await setDoc(doc(getFirestoreDB(), "users", newUser.uid), {
    uid: newUser.uid,
    name,
    email,
    phone: "",
    role,
    addresses: [],
    createdAt: serverTimestamp(),
  });
  
  return {
    uid: newUser.uid,
    name,
    email,
    role
  };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
}

// ─── Auth State ───────────────────────────────────────────────────────────────

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

// ─── Get Current User Data ───────────────────────────────────────────────────

export async function getCurrentUserData(uid: string): Promise<AppUser | null> {
  const docRef = doc(getFirestoreDB(), "users", uid);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...snapshot.data() } as AppUser;
}

export async function sendPasswordReset(email: string) {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export { auth };
