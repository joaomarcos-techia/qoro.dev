// src/lib/firebase-admin.ts
import { App, getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

if (!getApps().length) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("❌ FIREBASE_PROJECT_ID não está definido.");
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("❌ FIREBASE_CLIENT_EMAIL não está definido.");
  }
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error("❌ FIREBASE_PRIVATE_KEY não está definido.");
  }

  // Corrige quebras de linha e remove aspas extras
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/"/g, "");

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
} else {
  app = getApps()[0]!;
}

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { app as adminApp, adminAuth, adminDb };
