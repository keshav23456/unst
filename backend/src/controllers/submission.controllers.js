import { Submission } from "../models/submission.model.js"

export const createSubmission = async (req, res) => {
    try {
        const { hackathonId, teamId } = req.params;
        // A project submission is a link to the deployed project and a
        // repo link — not a file upload. The old version required a file
        // (field name "banner", copy-pasted from the hackathon-banner
        // flow) and stored *that* upload's URL as the submission, which
        // didn't match what a "submission" is supposed to be.
        const { submissionUrl, gitUrl } = req.body;

        if (!hackathonId || !teamId) {
            return res.status(400).json({ message: "Missing hackathon or team id" });
        }
        if (!submissionUrl || !gitUrl) {
            return res.status(400).json({ message: "Please provide both the project URL and the repo URL" });
        }

        // Was Submission.findById(teamId) — checking a Submission's own _id
        // against a team id, which can never match. findOne({teamId}) is
        // the actual duplicate check.
        const existing = await Submission.findOne({ teamId });
        if (existing) {
            return res.status(409).json({ message: "A submission already exists for this team" });
        }

        const submission = await Submission.create({
            hackathonId,
            teamId,
            submissionUrl,
            gitUrl,
        });

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
