import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account JSON manually
const serviceAccountPath = path.join(
  __dirname,
  "../config/serviceAccountKey.json"
);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

export default serviceAccount;
