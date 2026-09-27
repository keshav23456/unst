import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import { createSubmission, getSubmissions, deleteSubmissions } from '../controllers/submission.controllers.js';
import express from 'express';

const router = express.Router();

// No Multer here anymore: a submission is a JSON body (submissionUrl,
// gitUrl), not a file upload.
router.route("/create-submission/:hackathonId/:teamId").post(verifyJWT, createSubmission);
router.route("/fetch-submissions/:hackathonId").get(verifyJWT, getSubmissions);
router.route("/delete-submissions/:hackathonId").post(verifyJWT, deleteSubmissions);

export default router;
