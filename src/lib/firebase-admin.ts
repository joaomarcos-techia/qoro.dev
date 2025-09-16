
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env. Isso é crucial para o ambiente de servidor.
config({ path: `.env` });

let app: App;

const apps = getApps();
if (!apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!process.env.FIREBASE_PROJECT_ID) {
            throw new Error("FIREBASE_PROJECT_ID não está definido no ambiente.");
        }
        if (!process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error("FIREBASE_CLIENT_EMAIL não está definido no ambiente.");
        }
        if (!privateKey) {
            throw new Error("FIREBASE_PRIVATE_KEY não está definido no ambiente.");
        }

        app = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    } catch (e: any) {
        console.error("Falha na inicialização do Firebase Admin SDK:", e.message);
        throw new Error("Não foi possível inicializar o Firebase Admin. Verifique as variáveis de ambiente do servidor.");
    }
} else {
    app = apps[0];
}

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { app as adminApp, adminAuth, adminDb };
