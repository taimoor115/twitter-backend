import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
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

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
