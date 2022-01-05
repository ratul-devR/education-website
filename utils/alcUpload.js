const multer = require("multer");
const path = require("path");

module.exports = function (sub_folder_path) {
  const uploadFolder = `${__dirname}/../public/uploads/${sub_folder_path}`;

  const storage = multer.diskStorage({
    destination(_, _n, cb) {
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

  const upload = multer({ storage });

  return upload;
};
