import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("-password").lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
});

export const followUnfollowUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userToModify = await User.findById(id);
  const currentUser = await User.findById(req.user._id);

  if (id === req.user._id.toString()) {
    return next(new ApiError(400, "You can follow/unfollow yourself"));
  }

  if (!currentUser || !userToModify) {
    return next(new ApiError(400, "User not found..."));
  }

  const isFollowing = currentUser.following.includes(id);
  if (isFollowing) {
    await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

    return res
      .status(200)
      .json(new ApiResponse(200, "User unfollow successfully..."));
  } else {
    await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

    const notification = new Notification({
      type: "follow",
      from: req.user._id,
      to: id,
    });

    await notification.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "User follow sucesssfully..."));
  }
});

export const getSuggestedUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const userFollowedByMe = await User.findById(userId).select("following");

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: userId },
      },
    },
    {
      $sample: { size: 10 },
    },
  ]);

  const filterUsers = users.filter(
    (user) => !userFollowedByMe.following.include(user._id)
  );
  const suggestedUsers = filterUsers.slice(0, 4);
  suggestedUsers.forEach((user) => (user.password = null));

  res
    .status(200)
    .json(
      new ApiResponse(200, "Suggesed User fetched successfully", suggestedUsers)
    );
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ApiError(400, "All fields are required"));
  }

  if (confirmPassword !== newPassword)
    return next(
      new ApiError(400, "Confirm password and new password must be same")
    );

  const user = await User.findById(userId);
  const passwordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!passwordCorrect)
    return next(new ApiError(400, "Old Password is not correct"));

  user.password = newPassword;

  await user.save();

  return res
    .status(201)
    .json(new ApiResponse(201, "Password changed successfully..."));
});
