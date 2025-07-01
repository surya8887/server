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
    return next(new ApiError(400, "Please provide all fields", true));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "Email already exists", true));
  }

  const user = await User.create({ name, email, password });
  if (!user) return next(new ApiError(500, "Failed to create user", true));

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
const Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ApiError(400, "Please provide both email and password", true)
    );
  }

  const user = await User.findOne({ email });
  if (!user)
    return next(new ApiError(400, "Username or email already exists", true));
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword)
    return next(new ApiError(401, "Invalid email or password", true));
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // console.log(accessToken);

  setTokenCookies(res, accessToken, refreshToken); // ✅

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful", user.name));
});

//  📝 Logout controller
const Logout = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  // console.log(userId);

  if (!userId) return next(new ApiError(401, "Unauthorized", true));

  await User.findByIdAndUpdate(userId, { refreshToken: null });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions);

  return res.json(new ApiResponse(200, "User logged out successfully", null));
});

//  📝 UpdateProfile controller
const UpdateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) return next(new ApiError(401, "Unauthorized", true));

  const user = await User.findById(userId);
  if (!user) return next(new ApiError(404, "User not found", true));

 const avatar = req.file?.path;

  if (!avatar) return next(new ApiError(400, "Avatar is required", true));

  // Update fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      name: user.name,
      avatar: user.avatar,
    },
  });
});


export { SignUp, Login, Logout, UpdateProfile };
