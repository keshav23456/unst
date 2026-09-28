import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    avatar:{
      type:String,
      default:"https://res.cloudinary.com/dhxgaemnk/image/upload/v1741610813/Screenshot_2025-03-10_181632_a8mcwt.png"
    },
    walletAddress:{
      type:String
    },
    // RBAC: three tiers. participant is the default — anyone who signs up
    // starts here. organizer and admin are elevated roles; organizer can
    // create/manage their own hackathons (still gated by ownership checks
    // on top of this), admin can manage any hackathon and view all users.
    role: {
      type: String,
      enum: ["admin", "organizer", "participant"],
      default: "participant",
    },
    // Array, not a single string: logging in on a second device used to
    // overwrite the first device's token, silently logging it out on its
    // next refresh attempt. Each entry is one active session.
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    ownedHackathons:[
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref:"Hackathon"
      }
    ]
  
  },
  { timestamps: true }
);

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email,
            role:this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);


