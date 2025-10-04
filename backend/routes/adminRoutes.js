const express= require("express")
const {getAttendedStudentsList, getInterviewSummary} = require("../controllers/adminController.js")
const router= express.Router()

router.get("/", getAttendedStudentsList)

router.get("/summary/:userId", getInterviewSummary);

module.exports = router