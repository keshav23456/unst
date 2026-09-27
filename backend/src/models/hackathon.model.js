import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true
    },
    description: {
      type: String,
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    finaleDate: {
      type: Date,
      required: true,
    },
    prizePool: {
      type: Number,
      required: true,
    },
    votingOpen: {
      type: Boolean,
      default: false,
    },
    maxTeamSize: {
      type: Number,
      required: true,
    },
    roundTotal: {
      type: Number,
      required: true,
    },
    roundAt: {
      type: Number,
      default: 1,
    },
    banner:{
      type:String,
    },
    // Final-round winners. Previously set by the controller but missing
    // from the schema, so it was silently dropped on save and never
    // actually persisted.
    winners: {
      type: [String],
      default: [],
    }
    },
  { timestamps: true }
);

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);

