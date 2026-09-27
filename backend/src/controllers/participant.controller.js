import {Team} from '../models/team.model.js';
import { User } from '../models/user.model.js';
import { Hackathon } from '../models/hackathon.model.js';
import mongoose, { mongo } from "mongoose";

export const createTeam = async (req, res) => {
  try {
    
    const {teamName, description = "" } = req.body;
    const {hackathonId} =req.params;
    const userId = req.user._id;

    if ( !teamName || !hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Please Fill All the entries",
      });
    }

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }


    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const hackathonObjectId=new mongoose.Types.ObjectId(hackathon._id)
    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathonId: hackathonObjectId,
      $or: [{ leaderId: userId }, { memberIds: userId }],
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "You are already part of a team for this hackathon",
      });
    }

    
    // Create the team
    const newTeam = await Team.create({
      hackathonId: hackathonObjectId,
      teamName,
      description,
      leaderId: userId,
      roundAt: hackathon.roundAt,
      memberIds: [userId],
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      teamId: newTeam._id,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message,
    });
  }
};


export const getAllTeams = async(req,res)=>{
  try {
    const {hackathonId} = req.params;
    const teams = await Team.find({hackathonId});
    
    res.status(200).json(teams)
  } catch (error) {
    res.status(500).json({message:"Error while fetching"})
  }
}

export const joinTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    

    const team = await Team.findById(id);
    if (!team) {
            return res.status(404).json({
              success: false,
              message: "Team not found"
            });
          }

    const hackathon = await Hackathon.findById(team.hackathonId);

    
    // Check if user is already in another team for this hackathon
    const existingTeam = await Team.findOne({
      hackathonId: team.hackathonId,
      $or: [
        { leaderId: userId },
        { memberIds: userId }
      ]
    });

      if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "You are already part of a team for this hackathon",
        teamId:team._id
      });
    }
     
    if (team.leaderId.equals(userId) || team.memberIds.some((mId) => mId.equals(userId))) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this team",
        teamId:team._id
      });
    }

      //Check if team is already at max capacity
      if (team.memberIds.length + 1 > hackathon.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: "Team is already at maximum capacity"
        });
      }

    team.memberIds.push(req.user._id);

    await team.save();
    
    res.status(200).json(team._id);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTeam = async(req,res) => {
  const {id} = req.params;
  const response = await Team.findById(id);

  if(!response) return res.status(500).json({message:"Team not found"})

    const users = await User.find({ _id: { $in: response.memberIds } }, "name");
    
    const data = response.toObject();
    data.membersName = users;

  return res.status(200).json(data)
}