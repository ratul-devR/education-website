const Category = require("../models/category");

module.exports = {
  getCategories: async function (req, res, next) {
    try {
      const categories = (await Category.find({})) || [];

      res.status(201).json({ categories });
    } catch (err) {
      next(err);
    }
  },

  postCategory: async function (req, res, next) {
    try {
      const { categoryName } = req.body;

      const categoryExist = (await Category.findOne({ name: categoryName })) || null;

      if (categoryExist) {
        res.status(400).json({ msg: "This category already exists" });
      } else {
        const newCategory = new Category({ name: categoryName });
        await newCategory.save();

        const updatedCategories = await Category.find({});
        res
          .status(201)
          .json({ msg: `"${newCategory.name}" has been created`, categories: updatedCategories });
      }
    } catch (err) {
      next(err);
    }
  },

  deleteCategory: async function (req, res, next) {
    try {
      const { id } = req.params;

      const deletedDoc = await Category.findByIdAndDelete({ _id: id });

      const updatedDocs = await Category.find({});

      res
        .status(201)
        .json({ msg: `"${deletedDoc.name}" has been deleted`, categories: updatedDocs });
    } catch (err) {
      next(err);
    }
  },
};
