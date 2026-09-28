import { User } from '../models/user.model.js'
import { Hackathon } from '../models/hackathon.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import { Round } from '../models/round.model.js'
import { Submission } from "../models/submission.model.js"
import { Team } from "../models/team.model.js"

export const browseHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find();
        return res.status(200).json({ hackathons });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const registerHackathon = async (req, res) => {
    try {
        const { name, description, finaleDate, prizePool, votingOpen, maxTeamSize, roundTotal } = req.body;

        if ([name, description, finaleDate].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        if (prizePool == null || maxTeamSize == null || roundTotal == null) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const existedHackathon = await Hackathon.findOne({ name });
        if (existedHackathon) {
            return res.status(400).json({ message: "A hackathon with this name already exists" });
        }

        // Checked before any DB write now (was previously read after
        // Hackathon.create(), which meant a missing file crashed *after*
        // a hackathon document already existed).
        const bannerLocalPath = req.file?.path;
        if (!bannerLocalPath) {
            return res.status(400).json({ message: "Please upload a banner image" });
        }

        const banner = await uploadOnCloudinary(bannerLocalPath);
        if (!banner?.url) {
            return res.status(500).json({ message: "Error while uploading banner" });
        }

        const organizerId = req.user._id;

        // Single create with everything included, instead of create() then
        // two follow-up updates — removes the window where a Cloudinary
        // failure could leave an orphaned, bannerless, unowned hackathon.
        const hackathon = await Hackathon.create({
            name,
            organizerId,
            description,
            finaleDate,
            prizePool,
            votingOpen: !!votingOpen,
            maxTeamSize,
            roundTotal,
            banner: banner.url,
        });

        await User.findByIdAndUpdate(organizerId, {
            $push: { ownedHackathons: hackathon._id },
        });

        return res.status(201).json({ success: true, hackathon });
    } catch (error) {
        console.error("Error while registering hackathon:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getHackathonDetails = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        return res.status(200).json({ success: true, hackathon });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const addRound = async (req, res) => {
    try {
        const { id } = req.params;

        const hackathon = await Hackathon.findById(id);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        if (hackathon.roundAt > hackathon.roundTotal) {
            return res.status(400).json({ message: "All rounds have already been added" });
        }

        const round = await Round.create({
            hackathonId: hackathon._id,
            roundNumber: hackathon.roundAt,
            roundName: req.body.roundName || `Round ${hackathon.roundAt}`,
            roundType: req.body.roundType,
            judgingCriteria: req.body.judgingCriteria,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
        });

        return res.status(201).json({ success: true, round });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getRounds = async (req, res) => {
    try {
        const { id } = req.params;
        const rounds = await Round.find({ hackathonId: id });

        if (rounds.length === 0) {
            return res.status(404).json({ message: "No rounds found for this hackathon" });
        }
        return res.status(200).json(rounds);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getSubmissionsForHackathon = async (req, res) => {
    try {
        const { name } = req.params;

        const hackathon = await Hackathon.findOne({ name });
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        // Fixed: schema field is hackathonId, not hackathonName. Also
        // dropped populate("roundId ...") since Submission has no roundId
        // field — only teamId — so that populate was always a silent no-op.
        const submissions = await Submission.find({ hackathonId: hackathon._id })
            .populate("teamId");

        return res.status(200).json({ success: true, submissions });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Admin-only (see hackathonOrganizer.routes.js). No delete endpoint
// existed before this — if one had been added naively, it would have
// orphaned every Round/Team/Submission referencing this hackathon, since
// MongoDB doesn't enforce cascade delete the way SQL foreign keys do.
export const deleteHackathon = async (req, res) => {
    try {
        const { id } = req.params;

        const hackathon = await Hackathon.findByIdAndDelete(id);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        await Round.deleteMany({ hackathonId: id });
        await Team.deleteMany({ hackathonId: id });
        await Submission.deleteMany({ hackathonId: id });
        await User.updateMany(
            { ownedHackathons: id },
            { $pull: { ownedHackathons: id } }
        );

        return res.status(200).json({ success: true, message: "Hackathon and all related data deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const announceWinnersAndNextRound = async (req, res) => {
    try {
        const { hackathonName, roundId, winners } = req.body;

        const hackathon = await Hackathon.findOne({ name: hackathonName });
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        const round = await Round.findById(roundId);
        if (!round) return res.status(404).json({ message: "Round not found" });

        // Archive instead of hard-delete: submission history for the round
        // now survives winner announcement instead of being destroyed.
        round.winners = winners || [];
        round.status = "completed";
        await round.save();

        if (hackathon.roundAt >= hackathon.roundTotal) {
            hackathon.winners = winners || [];
            await hackathon.save();
            return res.status(200).json({ success: true, message: "Final round completed. Winners announced." });
        }

        const nextRound = await Round.create({
            hackathonId: hackathon._id, // was hackathonName — field doesn't exist on the schema
            roundNumber: hackathon.roundAt + 1,
            roundName: req.body.nextRoundName || `Round ${hackathon.roundAt + 1}`,
            roundType: req.body.nextRoundType,
            judgingCriteria: req.body.judgingCriteria,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
        });

        hackathon.roundAt += 1;
        await hackathon.save();

        return res.status(201).json({ success: true, message: "Next round created", nextRound });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
