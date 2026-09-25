// Lazily initialised Firebase client. The SDK is only downloaded when it's actually needed
// (contact form submit, /admin), so the public page stays light.
import type { FirebaseApp, FirebaseOptions } from "firebase/app";

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

/** The one account (email + password) allowed into /admin (also enforced by firestore.rules and /api/revalidate). */
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();

export async function getFirebaseApp(): Promise<FirebaseApp> {
  const { initializeApp, getApps } = await import("firebase/app");
  return getApps()[0] ?? initializeApp(config);
}

export async function getDb() {
  const [app, { getFirestore }] = await Promise.all([getFirebaseApp(), import("firebase/firestore")]);
  return getFirestore(app);
}

export async function getFirebaseAuth() {
  const [app, { getAuth }] = await Promise.all([getFirebaseApp(), import("firebase/auth")]);
  return getAuth(app);
}

export type ContactMessage = { name: string; email: string; message: string };

/** Writes a message to the `messages` collection. See firestore.rules for the matching security rules. */
export async function sendContactMessage(msg: ContactMessage): Promise<void> {
  const [db, { addDoc, collection, serverTimestamp }] = await Promise.all([getDb(), import("firebase/firestore")]);
  await addDoc(collection(db, "messages"), {
    name: msg.name,
    email: msg.email,
    message: msg.message,
    createdAt: serverTimestamp(),
  });
}
