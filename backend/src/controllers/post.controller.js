import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteImageOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

export const createPost = asyncHandler(async (req, res, next) => {
  const userId = req.user._id.toString();
  const { text } = req.body;
  const postImgLocalPath = req?.file?.path;

  if (!text || !postImgLocalPath)
    return next(
      new ApiError(400, "Post must have the description and image...")
    );

  const user = await User.findById(userId);
  if (!user) return next(new ApiError(400, "User not found..."));

  const postImage = await uploadOnCloudinary(postImgLocalPath);

  const newPost = new Post({
    text,
    user: userId,
    img: postImage.url,
    imgPublicId: postImage.public_id,
  });

  if (!newPost)
    return next(new ApiError(400, "Error occur while creating post..."));

  await newPost.save();

  return res
    .status(201)
    .json(new ApiResponse(201, "Post created successfully...", newPost));
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) return next(new ApiError(400, "Post not found..."));

  if (currentUserId.toString() !== post.user._id.toString())
    return next(new ApiError(401, "You are not one who created this post..."));

  await deleteImageOnCloudinary(post.imgPublicId);

  await Post.findByIdAndDelete(post._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Post deleted successfully..."));
});



