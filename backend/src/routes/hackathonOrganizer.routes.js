import {Router} from 'express';
import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import { addRound, getHackathonDetails, registerHackathon,getSubmissionsForHackathon, announceWinnersAndNextRound ,browseHackathons ,getRounds, deleteHackathon } from '../controllers/hackathon.controllers.js';
import {verifyHackathonOwner} from '../middleware/VerifyOwner.middleware.js'
import { requireRole, requireOwnerOrAdmin } from '../middleware/requireRole.middleware.js'

const router = Router();

router.route("/browse-events").get(browseHackathons)
// Only organizers (and admins) can create hackathons. Users pick
// "organizer" at signup; an admin can also promote any user. requireRole
// runs before multer so a rejected user never gets a file written to disk.
router.post("/create", verifyJWT, requireRole("organizer","admin"), upload.single("banner"), registerHackathon);

router.route("/:id").get(verifyJWT,getHackathonDetails);
router.route("/:id/delete").delete(verifyJWT, requireRole("admin"), deleteHackathon);
router.route("/:id/rounds/add").post(verifyJWT,requireRole("organizer","admin"),requireOwnerOrAdmin(verifyHackathonOwner),addRound);
router.route("/:id/rounds").get(verifyJWT, getRounds);
router.route("/:name/submissions").get(verifyJWT,requireRole("organizer","admin"),requireOwnerOrAdmin(verifyHackathonOwner),getSubmissionsForHackathon);
router.route("/:name/announce-winners").post(verifyJWT,requireRole("organizer","admin"),requireOwnerOrAdmin(verifyHackathonOwner),announceWinnersAndNextRound);


export default router