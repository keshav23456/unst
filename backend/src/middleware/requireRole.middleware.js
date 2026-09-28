// RBAC gate: restricts a route to specific roles. Must run after verifyJWT
// (needs req.user). Usage:
//   router.post("/x", verifyJWT, requireRole("admin"), handler)
//   router.post("/y", verifyJWT, requireRole("organizer", "admin"), handler)
//
// requireRole answers "is this TIER allowed to attempt this at all?".
// verifyHackathonOwner answers "does this user own THIS hackathon?".
// Routes that modify a specific hackathon use both (see requireOwnerOrAdmin).
//
// The role is read from the database on every request (verifyJWT loads the
// user), not trusted from the JWT payload, so an admin changing someone's
// role takes effect immediately instead of when their token expires.
export const requireRole = (...allowedRoles) => {
    return function requireRoleMiddleware(req, res, next) {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
            });
        }
        next();
    };
};

// Admins bypass the per-hackathon ownership check (they can manage any
// hackathon); everyone else still has to own it.
export const requireOwnerOrAdmin = (verifyHackathonOwner) => {
    return function ownerOrAdminMiddleware(req, res, next) {
        if (req.user?.role === "admin") return next();
        return verifyHackathonOwner(req, res, next);
    };
};
