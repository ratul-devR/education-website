const { unlink } = require("fs");
const path = require("path");

const Alc = require("../models/alc");
const Category = require("../models/category");

module.exports = {
  uploadSingleAlc: async function (req, res, next) {
    try {
      const {
        audio,
        video,
        background_music,
        passive_images,
        passive_audio,
        passive_background_sound,
      } = req.files;
      const { timeout, category, title } = req.body;

      const domain = req.protocol + "://" + req.get("host") + "/uploads/alc";

      const newAlc = new Alc({
        audio: { name: audio[0].filename, url: domain + "/" + audio[0].filename },
        video: { name: video[0].filename, url: domain + "/" + video[0].filename },
        background_music: background_music
          ? {
              name: background_music[0].filename,
              url: domain + "/" + background_music[0].filename,
            }
          : {},
        passive_images: passive_images.map((passive_image) => ({
          name: passive_image.filename,
          url: domain + "/" + passive_image.filename,
        })),
        passive_audio: {
          name: passive_audio[0].filename,
          url: domain + "/" + passive_audio[0].filename,
        },
        passive_background_sound: passive_background_sound
          ? {
              name: passive_background_sound[0].filename,
              url: domain + "/" + passive_background_sound[0].filename,
            }
          : {},
        timeout,
        title,
        category,
      });

      await newAlc.save();

      const updatedItemList = await Alc.find({}).lean({ defaults: true }).populate("category");

      res.status(201).json({ msg: "New Item was uploaded successfully", items: updatedItemList });
    } catch (err) {
      next(err);
    }
  },

  getItems: async function (_req, res, next) {
    try {
      const items = await Alc.find({}).lean({ defaults: true }).populate("category");

      res.status(200).json({ items });
    } catch (err) {
      next(err);
    }
  },

  deleteItem: async function (req, res, next) {
    try {
      const { id } = req.params;

      // delete the doc
      const item = await Alc.findByIdAndDelete({ _id: id });

      // delete all the files
      unlink(path.join(__dirname, `/../public/uploads/alc/${item.audio.name}`), (err) =>
        err ? err : null
      );
      unlink(path.join(__dirname, `/../public/uploads/alc/${item.video.name}`), (err) =>
        err ? err : null
      );
      if (item.background_music) {
        unlink(
          path.join(__dirname, `/../public/uploads/alc/${item.background_music.name}`),
          (err) => (err ? err : null)
        );
      }
      unlink(path.join(__dirname, `/../public/uploads/alc/${item.passive_audio.name}`), (err) =>
        err ? err : null
      );
      item.passive_images.map((passive_image) => {
        unlink(path.join(__dirname, `/../public/uploads/alc/${passive_image.name}`), (err) =>
          err ? err : null
        );
      });
      if (item.passive_background_sound) {
        unlink(
          path.join(__dirname, `/../public/uploads/alc/${item.passive_background_sound.name}`),
          (err) => (err ? err : null)
        );
      }

      // send the updated list
      const updatedList = await Alc.find({}).lean({ defaults: true }).populate("category");

      res.status(200).json({ items: updatedList, msg: "Deleted Successfully" });
    } catch (err) {
      next(err);
    }
  },

  getItemAccordingToId: async function (req, res, next) {
    try {
      const { id } = req.params;

      const category = await Category.findOne({ _id: id })
        .lean({ defaults: true })
        .populate("prerequisites");

      let item =
        (await Alc.findOne({
          $and: [{ category: category._id }, { viewers: { $nin: [req.user._id] } }],
        })) || null;

      category.purchasedBy = category.purchasedBy.map((user) => user.toString());
      const userHasPurchased = category.purchasedBy.includes(req.user._id.toString());

      let hasAllPrerequisites = true;
      for (let i = 0; i < category.prerequisites.length; i++) {
        const prerequisite = category.prerequisites[i];
        prerequisite.completedBy = prerequisite.completedBy.map((user) => user.toString());
        if (!prerequisite.completedBy.includes(req.user._id.toString()))
          hasAllPrerequisites = false;
      }

      res.status(200).json({ hasPurchased: userHasPurchased, item, hasAllPrerequisites });
    } catch (err) {
      next(err);
    }
  },

  userViewedConcert: async function (req, res, next) {
    try {
      const { concertId } = req.body;

      const alc = await Alc.findOne({ _id: concertId });
      alc.viewers = alc.viewers.map((viewer) => viewer.toString());
      const alreadyViewed = alc.viewers.includes(req.user._id.toString());
      !alreadyViewed &&
        (await Alc.updateOne({ _id: concertId }, { $push: { viewers: req.user._id } }).lean({
          defaults: true,
        }));

      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
};
