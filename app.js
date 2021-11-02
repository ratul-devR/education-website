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
const adminRouter = require("./routes/adminRouter");
const coursesRouter = require("./routes/coursesRouter");

// middleware's
const { notFoundHandler, errorHandler } = require("./middlewares/common/errorHandler");
const authorizeAmin = require("./middlewares/auth/authorizeAdmin");
const checkLogin = require("./middlewares/auth/checkLogin");

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
// only the admin can access it!
app.use("/get_admin", authorizeAmin, adminRouter);
// for handling all the courses stuff on the auth user end
app.use("/get_courses", checkLogin, coursesRouter);

// for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/dist"));

  app.get("*", function (req, res) {
    const fullPath = path.join(__dirname, "client", "dist", "index.html");
    res.sendFile(fullPath);
  });
}

// error handlings
app.use(notFoundHandler);
app.use(errorHandler);

// starting the server
app.listen(process.env.PORT, () => console.log(`Listening to port ${process.env.PORT}`));
