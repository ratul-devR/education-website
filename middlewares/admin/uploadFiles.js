const { existsSync, mkdirSync } = require("fs");
const path = require("path");

const upload = require("../../utils/fileUploader");

module.exports = function (req, res, next) {
  const dir = path.join(__dirname, "../../public/uploads/files");

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const uploader = upload("files");

  uploader.array("files")(req, res, (err) => {
    if (err) {
      res.status(500).json({
        msg: err.msg || "Unexpected server side error. When uploading file to the server",
      });
    } else {
      next();
    }
  });
};
