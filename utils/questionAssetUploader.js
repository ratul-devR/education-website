const multer = require("multer");
const path = require("path");

module.exports = function (sub_folder_path) {
  const uploadFolder = `${__dirname}/../public/uploads/${sub_folder_path}`;

  const storage = multer.diskStorage({
    destination(_, _, cb) {
      cb(null, uploadFolder);
    },
    filename: (_, file, cb) => {
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
    fileFilter: (_, file, cb) => {
      if (file.mimetype !== "audio/mpeg") {
        cb({ msg: "Only .mp3 file is allowed" });
      } else {
        cb(null, true);
      }
    },
  });

  return upload;
};
