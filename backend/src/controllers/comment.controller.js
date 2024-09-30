import Comment from "../models/comments.model.js";
import Post from "../models/post.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const commentOnPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const userId = req.user._id;
  const { text } = req.body;

  const post = await Post.findById(postId);
  if (!post) return next(new ApiError(400, "Post not found..."));
  const comment = new Comment({
    text,
    user: userId,
  });

  post.comments.push(comment);

  await comment.save();
  await post.save();

  return res
    .status(201)
    .json(new ApiResponse(201, "Comments created successfully..."));
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const { id, commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) return next(new ApiError(400, "No comment found..."));

  if (comment.user.toString() !== userId.toString()) {
    return next(
      new ApiError(401, "You are not the one who created this comment")
    );
  }

  await Post.findByIdAndUpdate(
    id,
    { $pull: { comments: commentId } },
    { new: true }
  );
  await Comment.findByIdAndDelete(commentId, { new: true });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment delete successfully..."));
});
