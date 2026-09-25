// Lazily initialised Firebase client (only loaded when the contact form is submitted).
import type { FirebaseOptions } from "firebase/app";

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export type ContactMessage = { name: string; email: string; message: string };

/** Writes a message to the `messages` collection. See README for the matching security rules. */
export async function sendContactMessage(msg: ContactMessage): Promise<void> {
  const [{ initializeApp, getApps }, { getFirestore, addDoc, collection, serverTimestamp }] = await Promise.all([
    import("firebase/app"),
    import("firebase/firestore"),
  ]);
  const app = getApps()[0] ?? initializeApp(config);
  const db = getFirestore(app);
  await addDoc(collection(db, "messages"), {
    name: msg.name,
    email: msg.email,
    message: msg.message,
    createdAt: serverTimestamp(),
  });
}
