import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve relative to this file (project root/.env), not the process's CWD,
// so `npm start` and `node src/index.js` work the same regardless of where
// they're invoked from.
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

import { connectDB } from "./db/connectDB.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB. Server not started.", error);
        process.exit(1);
    });