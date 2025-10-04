const express= require("express")
const {getStudentsList, getInterviewSummary} = require("../controllers/adminController.js")
const router= express.Router()

// GET http://localhost:5000/api/your-route?pageNumber=1&&filter=interviewTaken||interviewNotTaken||registered
router.get("/", getStudentsList)

router.get("/summary/:userId", getInterviewSummary);

module.exports = router