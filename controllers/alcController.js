const { unlink } = require("fs");
const path = require("path");

const Alc = require("../models/alc");

module.exports = {
  uploadSingleAlc: async function (req, res, next) {
    try {
      const { audio, video, background_music } = req.files;

      const domain = req.protocol + "://" + req.get("host") + "/uploads/alc";

      const newAlc = new Alc({
        audio: { name: audio[0].filename, url: domain + "/" + audio[0].filename },
        video: { name: video[0].filename, url: domain + "/" + video[0].filename },
        background_music: {
          name: background_music[0].filename,
          url: domain + "/" + background_music[0].filename,
        },
      });

      await newAlc.save();

      const updatedItemList = await Alc.find({});

      res.status(201).json({ msg: "New Item was uploaded successfully", items: updatedItemList });
    } catch (err) {
      next(err);
    }
  },

  getItems: async function (req, res, next) {
    try {
      const items = await Alc.find({});

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
      unlink(path.join(__dirname, `/../public/uploads/alc/${item.background_music.name}`), (err) =>
        err ? err : null
      );

      // send the updated list
      const updatedList = await Alc.find({});

      res.status(200).json({ items: updatedList, msg: "Deleted Successfully" });
    } catch (err) {
      next(err);
    }
  },

  getRandomItem: async function (req, res, next) {
    try {
      Alc.count().exec(function (err, count) {
        var random = Math.floor(Math.random() * count);

        Alc.findOne()
          .skip(random)
          .exec(function (err, result) {
            res.status(200).json({ item: result });
          });
      });
    } catch (err) {
      next(err);
    }
  },
};
