import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateRefreshAndAccessToken,
  options,
} from "../utils/generateToken.js";

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

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
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
