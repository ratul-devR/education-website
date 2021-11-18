const multer = require("multer");
const path = require("path");

module.exports = function (sub_folder_path) {
  const uploadFolder = `${__dirname}/../public/uploads/${sub_folder_path}`;

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname.replace(fileExt, "").toLowerCase().split(" ").join("-") +
        "-" +
        Date.now() +
        Math.floor(Math.random() * 1000);
      cb(null, fileName + fileExt);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, callback) => {
      if (file.mimetype !== "audio/mpeg") {
        callback({ msg: "Only audio/.mp3 file is allowed" });
      } else {
        callback(null, true);
      }
    },
  });

  return upload;
};
