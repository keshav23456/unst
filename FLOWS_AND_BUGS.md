# EventX — Flows & Full Bug Audit
(Blockchain/smart-contract layer excluded from scope, per instruction. Plain MERN stack only.)

## 1. User flows (as designed)

**Auth**
1. Register (name, email, password) → account created → access + refresh token issued as cookies.
2. Login (email, password) → tokens issued as cookies.
3. Access token expires → frontend calls `/refresh-token` → new access token issued.
4. Logout → refresh token cleared server-side, cookies cleared client-side.

**Organizer**
1. Create hackathon (name, description, finale date, prize pool, max team size, round count, banner image) → hackathon persisted, banner uploaded to Cloudinary, organizer's `ownedHackathons` updated.
2. Add a round (round name, type, judging criteria, dates) → only the owning organizer can do this.
3. View submissions for their hackathon.
4. Announce winners for the current round → either finalizes (last round) or creates the next round automatically.

**Participant**
1. Browse all hackathons.
2. Create a team for a hackathon (becomes leader) OR join an existing team (by team ID) up to `maxTeamSize`.
3. Submit a project (repo link + live URL) for their team, once per round.

## 2. Complete bug list found via direct code read

### Backend — server/infra
- `index.js`: `dotenv.config({path:'../.env'})` — resolves relative to process CWD, not the file location. Breaks depending on where `npm start`/`node` is run from.
- `connectDB.js`: a failed MongoDB connection is only logged, never thrown/exited — the server starts and accepts requests with no working database.
- `multer.middleware.js`: uploads write to `./public/temp`, a directory that doesn't exist in the repo and is never created at startup — **every file upload (banner, avatar, submission) crashes with ENOENT** on a fresh clone.
- `package.json` has no `start`/`dev` script and no `main` entry — `npm start` fails out of the box.
- `cloudinary.js`: `cloud_name` is hardcoded to a specific personal account instead of read from env — anyone running this uploads to the original developer's Cloudinary.

### Backend — auth
- `verifyJWT.middleware.js`: returns 401 for missing token but 403 for invalid/expired token — should both be 401 (authentication failure), reserving 403 for authorization failures.
- **`refresh-token` route is gated behind `verifyJWT`** — this defeats the entire purpose of the endpoint. If the access token is expired (the normal reason to call refresh), `verifyJWT` rejects the request before `refreshAccessToken` ever runs. The refresh flow is currently non-functional.
- `user.model.js`: `refreshToken` is a single `String`, not an array — logging in on a second device overwrites the first device's stored token, silently logging it out on its next refresh attempt.
- `registerUser`, `loginUser`, `refreshAccessToken`, `changeCurrentPassword`, `updateAccountDetails`: missing or incomplete try/catch — errors are `console.log`'d with no response sent to the client, or thrown uncaught. Client-side requests hang or fail silently instead of getting a real error response.
- `registerUser` vs `loginUser` use **different, inconsistent cookie options** (`domain:"localhost"` vs `domain:"eventx-backend-u79p.onrender.com"`, different `secure`/`sameSite`) — guaranteed to break in at least one environment.
- `updateAccountDetails`: destructures `fullName` but references undefined variable `name` when setting — throws `ReferenceError` every call.
- `authenticateWithMetaMask`: `User.findOne(req.user._id)` — wrong Mongoose usage, should be `findById` or `findOne({_id: ...})`.
- `registerUser`: calls `user.save()` twice (redundant).

### Backend — ownership/authorization
- **`VerifyOwner.middleware.js`: `user.ownedHackathons.includes(hackathon._id)` compares Mongoose ObjectId objects with `.includes()`, which uses strict reference equality — two ObjectIds with the same value are not `===` equal unless it's the literal same object.** This means the ownership check can fail for the actual, legitimate owner. Needs `.some(oid => oid.equals(hackathon._id))`.
- `isOrganizer.middleware.js` — empty file, unused, dead code.

### Backend — hackathon/round logic
- `registerHackathon`: never checks `req.file` exists before reading `req.file.path` — crashes if no banner is uploaded.
- `registerHackathon`: three separate writes to create one resource (`Hackathon.create` → banner `findByIdAndUpdate` → `User.ownedHackathons` push) with no transaction — a Cloudinary failure mid-sequence leaves an orphaned, bannerless, unowned hackathon.
- `getSubmissionsForHackathon`: queries `Submission.find({hackathonName: hackathon.name})` — schema has no `hackathonName` field, only `hackathonId`. Also `.populate("roundId teamId")` — schema has no `roundId` field. **Always returns empty, silently.**
- `announceWinnersAndNextRound`: creates the next round with `Round.create({hackathonName, ...})` — schema expects `hackathonId`. **The new round is created with a broken/missing hackathon link.**
- `announceWinnersAndNextRound`: sets `hackathon.winners = winners` — the `Hackathon` schema has no `winners` field at all; this is silently dropped on save and never persisted.
- `announceWinnersAndNextRound`: deletes the round and its submissions immediately on winner announcement — no archival, submission history for that round is destroyed the moment winners are declared.
- No cascade delete anywhere — deleting a hackathon (if implemented) would orphan its Rounds/Teams/Submissions. (Delete route is currently commented out.)

### Backend — submissions
- **`createSubmission` expects a file upload (`req.file`, field name `"banner"`) and stores the uploaded file's Cloudinary URL as `submissionUrl`**, while the actual submission link is a secondary text field (`Link` → `gitUrl`). This looks like copy-pasted logic from `registerHackathon` that was never adapted to the submission use case — participants shouldn't need to upload an arbitrary file just to submit a project link.
- `createSubmission`: `Submission.findById(teamId)` — checks whether a Submission's own `_id` equals `teamId`, which is never true by construction. Should be `Submission.findOne({teamId})` to actually detect duplicate submissions.

### Frontend — API integration
- **All 4 service files (`auth.js`, `organize.js`, `participant.js`, `submissions.js`) hardcode the production backend URL** (`https://eventx-backend-u79p.onrender.com`) — no env variable, so the frontend can never point at a local backend without manually editing every file.
- **`submissions.js: createSubmission` sends `JSON.stringify(data)` with `Content-Type: application/json`**, but the backend route requires `multipart/form-data` (`upload.single("banner")`). The frontend and backend disagree on the submission request format entirely — this call cannot currently succeed against the real backend.
- `submissions.js: deleteSubmission` calls `/delete-submission/${hackathonId}` (singular) — backend route is `/delete-submissions/:hackathonId` (plural). 404 on every call.
- `submissions.js`: stray empty template-literal backticks left after a `return` statement — harmless but clear copy-paste debris.

---
This document reflects the state of the code before fixes. See the accompanying fixed source and `SETUP.md` for what changed and how to run it.
