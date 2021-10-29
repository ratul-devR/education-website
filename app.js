// external dependencies
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// internal dependencies
// routers / routes
const authRouter = require("./routes/authRouter");

// middleware's
const { notFoundHandler, errorHandler } = require("./middlewares/common/errorHandler");

const app = express();

dotenv.config();

// application config
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err.message || err));

// application routes
app.use("/get_auth", authRouter);

// error handlings
app.use(notFoundHandler);
app.use(errorHandler);

// for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", function (req, res) {
    const fullPath = path.join(__dirname, "client", "dist", "index.html");
    res.sendFile(fullPath);
  });
}

// starting the server
app.listen(process.env.PORT, () => console.log(`Listening to port ${process.env.PORT}`));
