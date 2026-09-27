# EventX — Every fix applied

Grouped by area. Each entry: what was wrong → what changed. See FLOWS_AND_BUGS.md for the original bug audit (written before any fixes) if you want the "why" in more depth.

## Backend infra

| File | Was | Now |
|---|---|---|
| `src/index.js` | `dotenv.config({path:'../.env'})` — resolved relative to process CWD, broke depending on where you ran it from | Resolves relative to the file itself using `import.meta.url`, works regardless of invocation directory |
| `src/index.js` | Server started even if `connectDB()` failed | `connectDB()` now throws on failure; `index.js` catches it, logs, and `process.exit(1)` instead of running with no DB |
| `src/db/connectDB.js` | Swallowed connection errors, just logged and continued | Throws if `MONGO_URI` is missing or connection fails |
| `src/middleware/multer.middleware.js` | Wrote uploads to `./public/temp`, a directory that didn't exist in the repo → every upload crashed with `ENOENT` | Directory created (`public/temp/.gitkeep`), `.gitignore` updated to keep the folder but ignore its contents |
| `src/utils/cloudinary.js` | `cloud_name` hardcoded to the original developer's personal account | Reads `CLOUDINARY_CLOUD_NAME` from env like the other two credentials |
| `src/utils/cloudinary.js` | `fs.unlinkSync(localFilePath)` could itself throw if the file was already gone | Guarded with `fs.existsSync()` first |
| `package.json` | No `start`/`dev` script, no `main` entry — `npm start` failed immediately | Added both scripts and `main: "src/index.js"` |
| `package.json` | Both `bcrypt` and `bcryptjs` listed; only `bcryptjs` actually used anywhere | Removed unused `bcrypt` |

## Backend — auth & security

| File | Was | Now |
|---|---|---|
| `src/middleware/verifyJWT.middleware.js` | Returned 401 for missing token, 403 for invalid/expired — inconsistent | Both now 401 (authentication failures); 403 reserved for ownership/authorization checks |
| `src/models/user.model.js` | `refreshToken: String` — a single token per user | `refreshTokens: [{token, createdAt}]` — an array, so logging in on a second device doesn't silently log out the first |
| `src/controllers/user.controllers.js` | `registerUser`, `loginUser`, `refreshAccessToken`, `changeCurrentPassword` had missing/incomplete try-catch — errors were `console.log`'d with no HTTP response sent, so failed requests just hung on the client | Every handler now has full try/catch and always returns a real JSON error response |
| `src/controllers/user.controllers.js` | `registerUser` and `loginUser` used different, inconsistent cookie options (different `domain`, `secure`, `sameSite`) — one of the two was guaranteed to break depending on environment | Single shared `COOKIE_OPTIONS`, environment-aware (`secure`/`sameSite` driven by `NODE_ENV`), no hardcoded domain — works locally and in production without code changes |
| `src/controllers/user.controllers.js` | `updateAccountDetails` referenced an undefined variable `name` instead of the destructured `fullName` — threw `ReferenceError` every call | Fixed to use `fullName` |
| `src/controllers/user.controllers.js` | `logoutUser` cleared the user's *entire* `refreshToken` field — logging out on one device would've logged out all devices (once multi-device tokens were supported) | Now removes only the specific session/token for the device that's logging out |
| `src/controllers/user.controllers.js` | `refreshAccessToken` never rotated the refresh token — same token stayed valid indefinitely | Old token is invalidated and removed on each use; a new one is issued (refresh token rotation) |
| `src/routes/user.routes.js` | `/refresh-token` was gated behind `verifyJWT` — defeated the endpoint's purpose, since it exists specifically to handle an *expired* access token, which `verifyJWT` would reject first | Removed `verifyJWT` from this one route |
| `src/routes/user.routes.js`, `src/controllers/user.controllers.js` | `authenticateWithMetaMask` had a Mongoose misuse (`User.findOne(req.user._id)` instead of `findById`) | Removed entirely — blockchain/wallet auth is out of scope per instruction |

## Backend — authorization (ownership)

| File | Was | Now |
|---|---|---|
| `src/middleware/VerifyOwner.middleware.js` | `user.ownedHackathons.includes(hackathon._id)` — Mongoose ObjectIds compared with `.includes()` use reference equality, not value equality, so this could reject the actual, legitimate owner | Changed to `.some(id => id.equals(hackathon._id))` — correct value comparison |
| `src/middleware/VerifyOwner.middleware.js` | Only ever read `req.params.id` — but the `/:name/submissions` and `/:name/announce-winners` routes use a `:name` param, so ownership checks silently 404'd on those routes | Now checks both `:id` and `:name`, looking the hackathon up by whichever is present |
| `src/middleware/isOrganizer.middleware.js` | Empty file, unused | Deleted |
| `src/controllers/participant.controller.js` | Same `.includes()` reference-equality risk on `memberIds` | Changed to `.some(id => id.equals(userId))` |

## Backend — hackathon & round logic

| File | Was | Now |
|---|---|---|
| `src/controllers/hackathon.controllers.js` — `registerHackathon` | Read `req.file.path` *after* already creating the Hackathon document — a missing file crashed after a DB write had already happened | File presence is checked before any database write |
| `src/controllers/hackathon.controllers.js` — `registerHackathon` | Three separate writes (`Hackathon.create` → banner `findByIdAndUpdate` → owner `push`) with no rollback — a Cloudinary failure mid-sequence left an orphaned, bannerless, unowned hackathon | Banner is uploaded first; hackathon is created once with everything included; only the owner-array `push` remains as a genuinely separate follow-up write |
| `src/controllers/hackathon.controllers.js` — `getSubmissionsForHackathon` | Queried `Submission.find({hackathonName: ...})` — schema has no such field, only `hackathonId`; also `.populate("roundId teamId")` referenced a nonexistent `roundId` field | Fixed to query by `hackathonId`; dropped the invalid `roundId` populate |
| `src/controllers/hackathon.controllers.js` — `announceWinnersAndNextRound` | Created the next round with `Round.create({hackathonName, ...})` — schema field is `hackathonId` | Fixed |
| `src/controllers/hackathon.controllers.js` — `announceWinnersAndNextRound` | Set `hackathon.winners = winners`, but `Hackathon` schema had no `winners` field — silently dropped, never persisted | Added `winners: [String]` to `hackathon.model.js` |
| `src/controllers/hackathon.controllers.js` — `announceWinnersAndNextRound` | Hard-deleted the round and its submissions the moment winners were announced — destroyed submission history | Round is archived (`status: "completed"`, winners recorded on the round) instead of deleted; added `status` field to `round.model.js` |

## Backend — submissions (biggest design fix)

| File | Was | Now |
|---|---|---|
| `src/controllers/submission.controllers.js` — `createSubmission` | Required a **file upload** (Multer, field `"banner"`) and stored the uploaded file's Cloudinary URL as the submission — copy-pasted from the hackathon-banner logic and never adapted. The actual submission link (`Link` in body) was stored as a secondary `gitUrl` field | Now takes `submissionUrl` and `gitUrl` directly as JSON body fields — a submission is a link, not a file |
| `src/controllers/submission.controllers.js` — `createSubmission` | Duplicate-submission check was `Submission.findById(teamId)` — checks a Submission's own `_id` against a team ID, which can never match, so the check never actually worked | Fixed to `Submission.findOne({teamId})` |
| `src/routes/submissions.routes.js` | `create-submission` route required `upload.single("banner")` Multer middleware | Removed — route now expects a plain JSON body |

## Frontend — API wiring

| File | Was | Now |
|---|---|---|
| `src/backend/auth.js`, `organize.js`, `participant.js`, `submissions.js` | All 4 files hardcoded `https://eventx-backend-u79p.onrender.com` — frontend could never point at a local backend without manually editing every file | New `src/backend/apiConfig.js` reads `VITE_API_URL` from env; all 4 files import and use it |
| `src/backend/submissions.js` — `deleteSubmission` | Called `/delete-submission/${hackathonId}` (singular) — backend route is `/delete-submissions/` (plural) — always 404'd | Fixed to plural, matching the route |
| `src/backend/submissions.js` | Stray empty template-literal backticks after a `return` statement (harmless but dead code) | Removed |

## Frontend — submission flow (matches the backend redesign above)

| File | Was | Now |
|---|---|---|
| `src/components/Participants.jsx` | Submission form required a file upload ("Resume Upload" label — itself a leftover naming confusion) and built a `FormData` object that was then **never actually sent** — the code passed the raw `react-hook-form` object to `submissionService.createSubmission` instead, ignoring the FormData entirely | Form now has a proper "Project URL" text field; `onSubmit` sends `{submissionUrl, gitUrl}` as JSON, matching the fixed backend |
| `src/components/Participants.jsx` | Unused `bannerFile` state and `handleFileChange`, now-unused `Upload` icon import | Removed |

## Frontend — dead blockchain import

| File | Was | Now |
|---|---|---|
| `src/components/Organize.jsx` | Imported `createNewHackathon` from `../store/contractSlice` and `useDispatch`, neither ever actually used/called | Both removed |

## Not removed (left as-is, noted for awareness)

- `src/contracts/` folder, `src/store/contractSlice.js`, `WalletBox.jsx`, `MetaMaskAuth.jsx` — still present in the frontend tree. `contractSlice` was already unused (not wired into the Redux store) before this pass. `WalletBox`/`MetaMaskAuth` are linked into `Header.jsx` and removing them would require reworking that component; they don't call the backend `/metamask` route (which was removed), so they're inert rather than broken. Full removal was out of scope for this pass — flagged here if you want to do it later.
