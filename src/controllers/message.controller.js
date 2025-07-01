import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const getUsersForSidebar = asyncHandler(async (req, res, next) => {
  // 1) Check auth
  const loggedInUserId = req.user?._id;
  if (!loggedInUserId) {
    return next(new ApiError(401, "You are not logged in"));
  }
  const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
    "-password -refreshToken -__v"
  );

  // 3) Send response
  return res
    .status(200)
    .json(new ApiResponse(200, "Users retrieved successfully", users));
});

const getMessage = asyncHandler(async (req, res, next) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;
  console.log(myId);
  

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 }); // optional: sort by time

  if (!messages || messages.length === 0) {
    return next(new ApiError(404, "No messages found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Messages retrieved successfully", messages));
});

const sendMessage = asyncHandler(async (req, res, next) => {
  const { text, image } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (!text && !image) {
    return next(new ApiError(400, "Message cannot be empty"));
  }

  let imageUrl = "";

  if (image) {
    try {
      const uploadResponse = await uploadOnCloudinary(image);
      imageUrl = uploadResponse?.secure_url || "";
    } catch (err) {
      return next(new ApiError(500, "Image upload failed", [err]));
    }
  }

  const message = await Message.create({
    senderId,
    receiverId,
    text: text?.trim() || "",
    image: imageUrl,
  });

  if (!message) {
    return next(new ApiError(500, "Message creation failed"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent successfully", message));
});


export { getUsersForSidebar, getMessage,sendMessage };
