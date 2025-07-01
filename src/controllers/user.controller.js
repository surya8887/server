import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 🔐 Token generator
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(`Error generating tokens: ${error.message}`);
    throw new ApiError(500, "Token generation failed");
  }
};

// 🍪 Set tokens in cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);
};

// 🧾 Signup controller
const SignUp = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Please provide all fields");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  const user = await User.create({ name, email, password });
  if (!user) throw new ApiError(500, "Failed to create user");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  setTokenCookies(res, accessToken, refreshToken);

  const userData = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", userData));
});

//  📝 Login controller
const Login = asyncHandler(async (req, res, next) => {});

//  📝 Logout controller

const Logout = asyncHandler(async (req, res, next) => {});

//  📝 UpdateProfile controller

const UpdateProfile = asyncHandler(async (req, res, next) => {


    
});

export { SignUp, Login, Logout, UpdateProfile };
