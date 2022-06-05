// external dependencies
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// internal dependencies
// routers / routes
const authRouter = require("./routes/authRouter");
const adminRouter = require("./routes/adminRouter");
const coursesRouter = require("./routes/coursesRouter");
const quizRouter = require("./routes/quizRouter");
const alcRouter = require("./routes/alcRouter");
const settingsRouter = require("./routes/settingsRouter");

// middleware's
const { notFoundHandler, errorHandler } = require("./middlewares/common/errorHandler");
const authorizeAmin = require("./middlewares/auth/authorizeAdmin");
const checkLogin = require("./middlewares/auth/checkLogin");
const checkPaymentStatus = require("./middlewares/common/checkPaymentStatus");

const app = express();

// default/global middleware's
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "public")));
app.use(checkPaymentStatus);

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
app.use("/get_courses", coursesRouter);
// for handling all the quiz stuffs
app.use("/get_quiz", checkLogin, quizRouter);
// for handling the active learning concert like uploading getting deleting etc
app.use("/active_learning_concert", checkLogin, alcRouter);
// for handling some settings related things in the admin panel
app.use("/get_settings", settingsRouter);

// for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/dist"));

  app.get("*", function (_req, res) {
    const fullPath = path.join(__dirname, "client", "dist", "index.html");
    res.sendFile(fullPath);
  });
}

// error handlings
app.use(notFoundHandler);
app.use(errorHandler);

// starting the server
app.listen(process.env.PORT, () => console.log(`Listening to port ${process.env.PORT}`));
