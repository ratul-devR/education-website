const Settings = require("../models/settings");

module.exports = {
  getSettings: async function (_req, res, next) {
    try {
      const settings = await Settings.findOne({});

      if (!settings) {
        res.status(404).json({ msg: "No settings found" });
      } else {
        res.status(200).json({ settings });
      }
    } catch (err) {
      next(err);
    }
  },

  newSettings: async function (req, res, next) {
    try {
      const { appSubTitle, lang } = req.body;

      const newSettings = new Settings({ appSubTitle, lang });

      newSettings.save();

      res.status(201).json({ settings: newSettings, msg: "Updated Successfully" });
    } catch (err) {
      next(err);
    }
  },

  editSettings: async function (req, res, next) {
    try {
      const { settingId } = req.params;
      const update = req.body;

      const updatedSettings = await Settings.findOneAndUpdate(
        { _id: settingId },
        { ...update },
        { new: true }
      );

      res.status(201).json({ msg: "Updated Successfully", settings: updatedSettings });
    } catch (err) {
      next(err);
    }
  },
};
