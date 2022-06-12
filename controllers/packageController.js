const mongoose = require("mongoose");

const Package = require("../models/package");

module.exports = {
  getPackages: async function (req, res, next) {
    try {
      const packages = await Package.find({}).populate("products");

      res.status(200).json({ packages });
    } catch (err) {
      next(err);
    }
  },

  getPackageById: async function (req, res, next) {
    try {
      const { packageId } = req.params;

      if (!mongoose.isValidObjectId(packageId)) {
        res.status(403).json({ msg: "Invalid ID" });
        return;
      }

      const package = await Package.findOne({ _id: packageId }).populate("products");

      if (!package) {
        res.status(404).json({ msg: "This package with the id " + packageId + " was not found" });
        return;
      }

      res.status(200).json({ package });
    } catch (err) {
      next(err);
    }
  },

  createPackage: async function (req, res, next) {
    try {
      const { name, description, price, products } = req.body;

      const newPackage = new Package({ name, description, price, products });

      await newPackage.populate("products");

      await newPackage.save();

      res.status(201).json({ msg: "The package was created", package: newPackage });
    } catch (err) {
      next(err);
    }
  },

  updatePackage: async function (req, res, next) {
    try {
      const { packageId } = req.params;
      const { updatedPackage } = req.body;

      if (!mongoose.isValidObjectId(packageId)) {
        res.status(403).json({ msg: "Invalid ID" });
        return;
      }

      const package = await Package.findOneAndUpdate(
        { _id: packageId },
        { $set: { ...updatedPackage } },
        { new: true }
      ).populate("products");

      if (!package) {
        res.status(404).json({ msg: `Package with the id ${packageId} was not found` });
        return;
      }

      res.status(200).json({ msg: "Updated Successfully", package });
    } catch (err) {
      next(err);
    }
  },

  deletePackage: async function (req, res, next) {
    try {
      const { packageId } = req.params;

      if (!mongoose.isValidObjectId(packageId)) {
        res.status(403).json({ msg: "Invalid package id" });
        return;
      }

      const deletedPackage = await Package.findByIdAndRemove({ _id: packageId });

      res
        .status(200)
        .json({ msg: "The package was deleted successfully", package: deletedPackage });
    } catch (err) {
      next(err);
    }
  },
};
