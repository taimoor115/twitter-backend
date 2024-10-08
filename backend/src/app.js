import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import notificationRoute from "./routes/notification.route.js";
import ApiError from "./utils/ApiError.js";
import { swaggerServe, swaggerSetup } from "./swagger.js";
import postRouter from "./routes/post.route.js";
import commentRoute from "./routes/comment.route.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api-docs", swaggerServe, swaggerSetup);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRoute);

app.all("*", (req, res, next) => {
  next(new ApiError("404", "Page not found"));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).json({ error: message });
});
export default app;
