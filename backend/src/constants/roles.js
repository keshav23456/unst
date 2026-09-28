export const ROLES = Object.freeze({
    ADMIN: "admin",
    ORGANIZER: "organizer",
    PARTICIPANT: "participant",
});

export const ROLE_LIST = Object.values(ROLES);

// Roles a user may pick for themselves at signup. "admin" is deliberately
// NOT here: it can only come from ADMIN_EMAIL or from another admin.
export const SELF_ASSIGNABLE_ROLES = [ROLES.PARTICIPANT, ROLES.ORGANIZER];

// Read at call time (not import time) so it works after dotenv has loaded.
export const isAdminEmail = (email) => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    return !!adminEmail && typeof email === "string" && email.trim().toLowerCase() === adminEmail;
};

export const resolveRegistrationRole = (email, requestedRole) => {
    if (isAdminEmail(email)) return ROLES.ADMIN;
    return SELF_ASSIGNABLE_ROLES.includes(requestedRole) ? requestedRole : ROLES.PARTICIPANT;
};
