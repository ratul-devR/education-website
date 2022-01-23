const { existsSync, mkdirSync } = require("fs");
const path = require("path");

const upload = require("../../utils/csvQuestionUpload");

module.exports = function (req, res, next) {
  const dir = path.join(__dirname, "../../public/uploads/convertedFiles");

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const uploader = upload("convertedFiles");

  uploader.single("file")(req, res, (err) => {
    if (err) {
      res.status(500).json({
        msg: err.msg || "Unexpected server side error. When uploading file to the server",
      });
    } else {
      next();
    }
  });
};
