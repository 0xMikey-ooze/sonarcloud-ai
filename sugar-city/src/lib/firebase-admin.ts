import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Lazy initialization to avoid build-time errors when env vars aren't available
interface ServiceAccount {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
    [key: string]: unknown;
}

function initializeFirebaseAdmin() {
    if (getApps().length === 0) {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
        const envProjectId = process.env.FIREBASE_PROJECT_ID?.trim();

        if (!serviceAccountKey) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required');
        }

        if (!envProjectId) {
            throw new Error('FIREBASE_PROJECT_ID environment variable is required');
        }

        const parsedServiceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;

        return initializeApp({
            credential: cert(parsedServiceAccount),
            projectId: envProjectId,
        });
    }
    return getApp();
}

export function getAdminApp() {
    return initializeFirebaseAdmin();
}

export function getAdminDb() {
    return getFirestore(getAdminApp());
}

