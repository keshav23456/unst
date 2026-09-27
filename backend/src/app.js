import express from 'express'
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express();

// CORS origins come from env (comma-separated) so a new deployment doesn't
// need a code change — just update CORS_ORIGINS in the environment.
// Falls back to local dev + the original Vercel URL if unset.
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "https://eventx-beige.vercel.app"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.urlencoded({extended:true,limit:"10mb"}))
app.use(express.json({limit:"10mb"}))
app.use(cookieParser())

// Health check — used by the hosting platform to verify the service is up.
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

import userRoutes from './routes/user.routes.js';
import hackathonRoutes from './routes/hackathonOrganizer.routes.js'
import participantRoutes from './routes/participants.routes.js';
import submissionRoutes from './routes/submissions.routes.js'

app.use("/api/v1/user",userRoutes)
app.use("/api/v1/hackathon/organizer",hackathonRoutes)
app.use("/api/v1/hackathon/participant", participantRoutes);
app.use("/api/v1/hackathon/submissions",submissionRoutes)

export{app}
