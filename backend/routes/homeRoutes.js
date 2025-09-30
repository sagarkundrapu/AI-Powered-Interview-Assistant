const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');
const isAdminUser = require("../middlewares/adminMiddleware.js")

const router = express.Router();

router.post("/",authMiddleware, (req, res) => {
    //we have this info from the authMiddleware
    const { username, userId, role } = req.userInfo
    
    res.json({
        message: "Welcome to the user home page",
        user: { username, userId, role }
    })
});

router.post("/interviewpage",authMiddleware, (req, res) => {
    //we have this info from the authMiddleware
    const { username, userId, role, interviewTaken} = req.userInfo
    if(interviewTaken){
        res.end({
            success: false,
            message: "You have already taken the test"
        })
    }else{
        res.json({
            message: "Welcome to the interview page",
            user: { username, userId, role, interviewTaken }
         })
    }
});

router.post("/dashboard",authMiddleware, isAdminUser, (req, res) => {
    const { username, userId, role} = req.userInfo
    
    res.json({
        message: "Welcome to the admin dashboard page",
        user: { username, userId, role }
    })
});

module.exports = router;