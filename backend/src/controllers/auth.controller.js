import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateRefreshAndAccessToken,
  options,
} from "../utils/generateToken.js";
import {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../sendMail/email.js";

export const signUpUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, fullName } = req.body;
  console.log(fullName);

  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    return next(new ApiError("400", "Email is already taken"));
  }

  const newUser = await User.create({ username, email, password, fullName });

  const createdUser = await User.findById(newUser?.id).select("-password");

  if (!createdUser) {
    return next(
      new ApiError("400", "Something went wrong while creating the user...")
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, "User created succesfully", { user: createdUser })
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Invalid email and password");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError("400", "Invalid email and password");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    user._id,
    User
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        accessToken,
        refreshToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logout successfully..."));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body || req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized Request");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user?.refreshToken === incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expires...");
    }

    const { accessToken, newRefreshToken } =
      await generateRefreshAndAccessToken(user_id, User);

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, "New tokens provided successfully  "));
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid token");
  }
});

export const getMe = asyncHandler(async (req, res, next) => {
  const id = req.user._id;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    return next(new ApiError(400, "No user found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User feteched successfully", user));
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ApiError(400, "Email is not correct..."));

  const resetPasswordToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;

  await user.save();

  await sendPasswordResetEmail(
    email,
    `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Reset email send successfully..."));
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(200, "Token expires..."));
  }

  if (!password) return next(new ApiError(200, "Password is required"));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiresAt = undefined;

  await user.save();

  await sendPasswordResetSuccessEmail(user.email);

  res.status(200).json(new ApiResponse(200, "Password reset successfully..."));
});