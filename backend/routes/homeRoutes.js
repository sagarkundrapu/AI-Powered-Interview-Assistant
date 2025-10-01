const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware.js"); // multer config
const uploadAndParseResume = require("../controllers/homeController.js")


//resume upload and parse
router.post("/parse", upload.single("resume"), uploadAndParseResume);

module.exports = router;