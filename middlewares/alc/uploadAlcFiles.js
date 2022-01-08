const { existsSync, mkdirSync } = require("fs");
const path = require("path");

const uploader = require("../../utils/alcUpload");

module.exports = function (req, res, next) {
  const dir = path.join(__dirname, "../../public/uploads/alc");

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const upload = uploader("alc");

  upload.fields([
    { name: "background_music", maxCount: 1 },
    { name: "passive_image", maxCount: 1 },
    { name: "passive_background_sound", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      res.status(500).json({ msg: err.message });
    } else {
      next();
    }
  });
};
