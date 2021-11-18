const { existsSync, mkdirSync } = require("fs");
const path = require("path");

const uploader = require("../../utils/quizAssetUploader");

module.exports = function (req, res, next) {
  const dir = path.join(__dirname, "../../public/uploads/quiz-assets");

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const upload = uploader("quiz-assets");

  upload.fields([
    { name: "background_sound" },
    { name: "positive_sound" },
    { name: "negative_sound" },
  ])(req, res, (err) => {
    if (err) {
      res.status(500).json({ msg: err.msg });
    } else {
      next();
    }
  });
};
