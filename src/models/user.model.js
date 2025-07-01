import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    username: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    avatar: {
      type: String,
      default: "default.jpg", // fallback if none provided
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

// 🔍 Compare raw password with hashed password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// 🪪 Generate Access Token (1 hour)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

// 🔄 Generate Refresh Token (1 day)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
};

export default mongoose.model("User", userSchema);
