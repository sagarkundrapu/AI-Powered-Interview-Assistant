const express = require("express");
const { askQuestion, verifyResponse } = require("../utils/callInterviewBot.js");

const router = express.Router();

//check if test taken, if not taken show instructions
router.get("/",(req,res)=>{
    const { username, userId, role, interviewTaken} = req.userInfo
    if(interviewTaken){
        res.json({
            success: false,
            message: "You have already taken the test"
        })
    }else{
        res.json({
            success: true,
            message: "Welcome to the interview page",
            user: { username, userId, role, interviewTaken }
         })
    }
})

// GET a new question
router.get("/start", askQuestion);

// POST an answer to be rated and stored
router.post("/submit", verifyResponse);



module.exports = router;