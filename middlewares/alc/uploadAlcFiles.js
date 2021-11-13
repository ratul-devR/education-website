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
    { name: "audio" },
    { name: "video" },
    { name: "background_music" },
    { name: "passive_gif" },
    { name: "passive_background_sound" },
  ])(req, res, (err) => {
    if (err) {
      res.status(500).json({ msg: err.message });
    } else {
      next();
    }
  });
};
