import Comment from "../models/comment.model.js";
import ApiError from "../utils/ApiError.js";

export const isAuthor = async (req, res, next) => {
  const userId = req.user._id;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (userId.toString() !== comment.user._id.toString())
    return next(
      new ApiError(401, "You are not the one who created this comment...")
    );

  next();
};
