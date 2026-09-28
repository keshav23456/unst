import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import { requireRole, requireOwnerOrAdmin } from '../middleware/requireRole.middleware.js';
import { verifyHackathonOwner } from '../middleware/VerifyOwner.middleware.js';
import { createSubmission, getSubmissions, deleteSubmissions } from '../controllers/submission.controllers.js';
import express from 'express';

const router = express.Router();

// Participants submit (and the controller checks they're on that team).
// Viewing/deleting a hackathon's submissions is limited to its organizer or
// an admin — previously any signed-in user could delete them.
router.route("/create-submission/:hackathonId/:teamId").post(verifyJWT, requireRole("participant"), createSubmission);
router.route("/fetch-submissions/:hackathonId").get(verifyJWT, requireRole("organizer","admin"), requireOwnerOrAdmin(verifyHackathonOwner), getSubmissions);
router.route("/delete-submissions/:hackathonId").post(verifyJWT, requireRole("organizer","admin"), requireOwnerOrAdmin(verifyHackathonOwner), deleteSubmissions);

export default router;
