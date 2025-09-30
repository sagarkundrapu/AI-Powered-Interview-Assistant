const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware.js"); // multer config
const {uploadResume, parseResume} = require("../controllers/homeController.js")


//resume upload
router.post("/", upload.single("resume"), uploadResume);

//resume parsing
router.post("/parse", parseResume);



module.exports = router;