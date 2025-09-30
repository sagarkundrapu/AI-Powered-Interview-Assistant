const express= require("express")
const {getAttendedStudentsList, getInterviewSummary} = require("../controllers/adminController.js")
const router= express.Router()

router.get("/", getAttendedStudentsList)

router.get("/summary/:username", getInterviewSummary);

module.exports = router