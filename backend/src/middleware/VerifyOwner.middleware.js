import { Hackathon } from "../models/hackathon.model.js";

export const verifyHackathonOwner = async (req, res, next) => {
    try {
        const user = req.user;
        // Some routes identify the hackathon by :id, others by :name — this
        // used to only ever read :id, so it silently 404'd on every
        // :name-based route (submissions, announce-winners).
        const { id, name } = req.params;

        const hackathon = id
            ? await Hackathon.findById(id)
            : await Hackathon.findOne({ name });

        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        // ObjectId objects are not === equal even when their values match, so
        // Array.includes() (reference equality) can wrongly reject the real
        // owner. .equals() does a proper value comparison.
        const isOwner = user.ownedHackathons.some((ownedId) => ownedId.equals(hackathon._id));
        if (!isOwner) {
            return res.status(403).json({ message: "Access denied. You are not the owner of this hackathon." });
        }

        next(); // Proceed if the user is the owner
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
