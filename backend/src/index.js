import app from "./app.js";
import connectDatabase from "./db/index.js";
import dotenv from "dotenv";
dotenv.config();

const dbURL = process.env.MONGO_URL;

connectDatabase(dbURL)
  .then(() => {
    app.listen(process.env.PORT || "8080", () => {
      console.log(`App is working on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error occur in connection", error);
  });
