import { Submission } from "../models/submission.model.js"
import { Team } from "../models/team.model.js"
import { Hackathon } from "../models/hackathon.model.js"

export const createSubmission = async (req, res) => {
    try {
        const { hackathonId, teamId } = req.params;
        // A submission is two links (deployed project + repo), not a file.
        const { submissionUrl, gitUrl } = req.body;

        if (!hackathonId || !teamId) {
            return res.status(400).json({ message: "Missing hackathon or team id" });
        }
        if (!submissionUrl || !gitUrl) {
            return res.status(400).json({ message: "Please provide both the project URL and the repo URL" });
        }

        const team = await Team.findById(teamId);
        if (!team || !team.hackathonId.equals(hackathonId)) {
            return res.status(404).json({ message: "Team not found for this hackathon" });
        }
        // Resource-level authorization: only members of the team may submit
        // for it (previously any signed-in user could submit for any team).
        const isMember = team.leaderId?.equals(req.user._id)
            || team.memberIds.some((m) => m.equals(req.user._id));
        if (!isMember) {
            return res.status(403).json({ message: "Only members of this team can submit for it" });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        // One submission per team *per round*.
        const roundNumber = hackathon.roundAt;
        const existing = await Submission.findOne({ teamId, roundNumber });
        if (existing) {
            return res.status(409).json({ message: "Your team has already submitted for this round" });
        }

        const submission = await Submission.create({ hackathonId, teamId, roundNumber, submissionUrl, gitUrl });
        return res.status(201).json({ message: "Submission created successfully", submission });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getSubmissions = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const submissions = await Submission.find({ hackathonId });
        return res.status(200).json({ submissions });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteSubmissions = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        await Submission.deleteMany({ hackathonId });
        return res.status(200).json({ message: "Submissions deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
