import {Router} from 'express';
import { changeCurrentPassword,
         loginUser,
         logoutUser,
         getCurrentUser,
         refreshAccessToken,
         registerUser,
         updateAccountDetails,
         updateUserAvatar,
         getAllUsers,
         updateUserRole } from '../controllers/user.controllers.js';
import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import { requireRole } from '../middleware/requireRole.middleware.js';

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
// NOT behind verifyJWT: this endpoint exists specifically to handle an
// expired access token, so gating it behind the same check that rejects
// expired tokens made it unreachable in the exact case it's meant for.
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-details").post(verifyJWT, updateAccountDetails);
router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/admin/users").get(verifyJWT, requireRole("admin"), getAllUsers);
// PUT, not PATCH: CORS in app.js only allows GET/POST/PUT/DELETE.
router.route("/admin/users/:id/role").put(verifyJWT, requireRole("admin"), updateUserRole);

export default router
