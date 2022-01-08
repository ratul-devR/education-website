const { unlink } = require("fs");

const Alc = require("../models/alc");

module.exports = {
  uploadSingleAlc: async function (req, res, next) {
    try {
      const { background_music, passive_image, passive_background_sound } = req.files;
      const { category } = req.body;

      const domain = req.protocol + "://" + req.get("host") + "/uploads/alc/";

      const alreadyHaveAConcertInCategory = await Alc.findOne({ category });

      if (alreadyHaveAConcertInCategory) {
        background_music &&
          unlink(
            __dirname + "/../" + "public/uploads/alc/" + background_music[0].filename,
            (err) => {
              if (err) console.log(err);
            }
          );
        unlink(__dirname + "/../" + "public/uploads/alc/" + passive_image[0].filename, (err) => {
          if (err) console.log(err);
        });
        passive_background_sound &&
          unlink(
            __dirname + "/../" + "public/uploads/alc/" + passive_background_sound[0].filename,
            (err) => {
              if (err) console.log(err);
            }
          );
        res.status(400).json({ msg: "Already have a concert in this category. If you want to re-upload, please delete the previous one first" });
      } else {
        const newItem = new Alc({
          background_sound: background_music
            ? {
                name: background_music[0].filename,
                url: domain + background_music[0].filename,
              }
            : {},
          passive_image: {
            name: passive_image[0].filename,
            url: domain + passive_image[0].filename,
          },
          passive_background_sound: passive_background_sound
            ? {
                name: passive_background_sound[0].filename,
                url: domain + passive_background_sound[0].filename,
              }
            : {},
          category,
        });

        await newItem.save();
        await newItem.populate("category");

        res.status(201).json({ msg: "The Item was uploaded successfully", item: newItem });
      }
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

      const item = await Alc.findByIdAndRemove(id);

      // delete the files
      function handleDelete(err) {
        if (err) {
          console.log(err);
        }
      }

      item.background_sound &&
        unlink(__dirname + "/../public/uploads/alc/" + item.background_sound.name, handleDelete);
      item.passive_background_sound &&
        unlink(
          __dirname + "/../public/uploads/alc/" + item.passive_background_sound.name,
          handleDelete
        );
      unlink(__dirname + "/../public/uploads/alc/" + item.passive_image.name, handleDelete);

      res.status(201).json({ msg: "Deleted successfully", item });
    } catch (err) {
      next(err);
    }
  },

  getItemAccordingToId: async function (req, res, next) {
    try {
      const { id } = req.params;

      const alc = await Alc.findOne({ category: id });

      res.status(200).json({ item: alc });
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
