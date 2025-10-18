import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

// Resolve dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account JSON if present; export null otherwise
const serviceAccountPath = path.join(
  __dirname,
  "../config/serviceAccountKey.json"
);

let serviceAccount = null;
let bucket = null;

try {
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    
    // Initialize Firebase Admin if service account is available
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: serviceAccount.project_id + ".appspot.com"
      });
    }
    
    // Initialize Storage bucket
    bucket = admin.storage().bucket();
    console.log("✅ Firebase Admin and Storage initialized");
  } else {
    console.warn(
      "[firebase] serviceAccountKey.json not found at",
      serviceAccountPath,
      "– skipping Firebase Admin initialization."
    );
  }
} catch (err) {
  console.error("[firebase] Failed to load service account:", err.message);
  serviceAccount = null;
  bucket = null;
}

export default serviceAccount;
export { bucket };
