const multer = require("multer");
const path = require("path");

module.exports = function (sub_folder_path) {
  const uploadFolder = `${__dirname}/../public/uploads/${sub_folder_path}`;

  const storage = multer.diskStorage({
    destination(_, _n, cb) {
      cb(null, uploadFolder);
    },
    filename: (_, file, cb) => {
      const fileName = file.originalname;
      cb(null, fileName);
    },
  });

  const upload = multer({ storage });

  return upload;
};
