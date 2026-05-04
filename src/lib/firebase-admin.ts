import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// ✅ Load service account
const filePath = path.join(process.cwd(), "serviceAccount.json");

let serviceAccount: admin.ServiceAccount;

try {
  const file = fs.readFileSync(filePath, "utf8");
  serviceAccount = JSON.parse(file);
  console.log("✅ Service account loaded");
} catch (err) {
  console.error("❌ Failed to load service account:", err);
}

// ✅ Initialize Firebase safely
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase initialized");
  } catch (error) {
    console.error("❌ Firebase init error:", error);
  }
}

// ✅ Always export AFTER init
const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };