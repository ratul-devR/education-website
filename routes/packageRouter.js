const { getPackages, createPackage, deletePackage } = require("../controllers/packageController");

const checkLogin = require("../middlewares/auth/checkLogin");
const authorizeAdmin = require("../middlewares/auth/authorizeAdmin");
const requireFields = require("../middlewares/common/requireFields");

const router = require("express").Router();

router.get("/", checkLogin, getPackages);
router.post(
  "/create_package",
  authorizeAdmin,
  requireFields({ fields: ["name", "description", "price", "products"], property: "body" }),
  createPackage
);
router.delete(
  "/delete_package/:packageId",
  authorizeAdmin,
  requireFields({ fields: ["packageId"], property: "params" }),
  deletePackage
);

module.exports = router;
