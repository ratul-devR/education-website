module.exports = {
  notFoundHandler: function (req, res, next) {
    next({ status: 404, message: "Your requested route was not found" });
  },

  errorHandler: function (err, req, res, next) {
    if (res.headersSent) {
      next("There was an unexpected error");
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log(err.message || err);
      }

      res.status(err.status || 500).json({ status: err.status || 500, msg: err.message || err });
    }
  },
};
