import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Testing from backend root directory");
console.log("Current directory:", __dirname);

// Test loading .env from current directory
const result = dotenv.config();
console.log("Dotenv result:", result);
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);

