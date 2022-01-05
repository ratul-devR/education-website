const { existsSync, mkdirSync } = require("fs");
const path = require("path");

const uploader = require("../../utils/quizAssetUploader");

module.exports = function (req, res, next) {
  const dir = path.join(__dirname, "../../public/uploads/question-audios");

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const upload = uploader("question-audios");

  upload.fields([
    { name: "activeLearningVoice", maxCount: 1 },
    { name: "passiveLearningVoice", maxCount: 1 },
    { name: "passiveLearningMaleVoice", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      res.status(500).json({ msg: err.msg });
    } else {
      next();
    }
  });
};
