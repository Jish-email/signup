import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  Firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  otp:{
    type:Number,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otpExpiry: {
    type: Date,
  },

}, {
  timestamps: true
  
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})
userSchema.methods.isPasswordCorrect = async function (password) {
  console.log('Stored password hash:', this.password); // Log the stored password hash
  if (!this.password) {
    throw new Error('Stored password is missing');
  }
  return await bcrypt.compare(password, this.password);
};



userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema);

