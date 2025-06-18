import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  console.log('🔥 Initializing Firebase with project:', process.env.FIREBASE_PROJECT_ID);
  
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  // Debug log to check if project_id is being read
  console.log('Project ID from env:', process.env.FIREBASE_PROJECT_ID);
  console.log('Service account project_id:', serviceAccount.project_id);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const bucket = getStorage().bucket();

// Upload file to Firebase Storage and return public URL
export async function uploadToFirebase(filePath, fileName) {
  try {
    const destination = `minipods/${fileName}`;
    
    await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        metadata: {
          contentType: 'audio/mpeg',
        },
      },
    });

    // Make the file publicly accessible
    await bucket.file(destination).makePublic();

    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${destination}`;
    
    console.log(`✅ File uploaded to Firebase: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Firebase upload error:', error);
    throw error;
  }
}

// Clean up local file after upload
export function cleanupLocalFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up local file: ${filePath}`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up file:', error);
  }
}

export { bucket };