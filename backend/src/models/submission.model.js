import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  hackathonId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
  },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team", 
    required: true 
  },
  submissionUrl: { 
    type: String, 
    required: true 
  },
  gitUrl:{
    type:String,
    required:true
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Submission = mongoose.model("Submission", SubmissionSchema);
