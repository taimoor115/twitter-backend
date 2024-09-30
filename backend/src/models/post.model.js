import mongoose from "mongoose";
import Comment from "./comment.model.js";
import Like from "./like.model.js";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    imgPublicId: {
      type: String,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

postSchema.post("findOneAndDelete", async (post) => {
  if (post.comments.length) {
    await Comment.deleteMany({ _id: { $in: post.comments } });
  }
  if (post.likes.length) {
    await Like.deleteMany({ _id: { $in: post.likes } });
  }
});


const Post = mongoose.model("Post", postSchema);
export default Post;
