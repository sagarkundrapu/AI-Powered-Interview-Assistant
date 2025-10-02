const express = require("express");
const { askQuestion, verifyResponse } = require("../utils/callInterviewBot.js");
const {updateInterviewStatus, checkInterviewTaken} = require("../controllers/interviewController.js")

const router = express.Router();

//check if test taken, if not taken show instructions
router.get("/",checkInterviewTaken)

// GET a new question
router.get("/start", askQuestion);

// POST an answer to be rated and stored
router.post("/submit", verifyResponse);

//to update interview status
router.post("/interview-status",updateInterviewStatus)



module.exports = router;