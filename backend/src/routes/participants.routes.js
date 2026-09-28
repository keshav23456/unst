import { createTeam, joinTeam ,getAllTeams, getTeam } from '../controllers/participant.controller.js';
import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import { requireRole } from '../middleware/requireRole.middleware.js';
import express from 'express';

const router=express.Router();
// Creating/joining a team is a participant action. Reads stay open to any
// signed-in user.
router.route("/create-team/:hackathonId").post(verifyJWT, requireRole("participant"), createTeam);
router.route("/allteam/:hackathonId").get(verifyJWT,getAllTeams)
router.route("/join-team/:id").post(verifyJWT, requireRole("participant"), joinTeam)
router.route("/team-details/:id").get(verifyJWT,getTeam)

export default router;
