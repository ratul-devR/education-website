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
      const newSettings = new Settings({ ...req.body });

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
