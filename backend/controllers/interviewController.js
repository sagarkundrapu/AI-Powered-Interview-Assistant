const User = require("../models/userModel.js")


const checkInterviewTaken = async(req,res)=>{
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
}

const updateInterviewStatus= async(req,res)=>{
    try{
        const {userId} = req.userInfo
        const { interviewTaken } = req.body
        const updatedUserData = await User.findByIdAndUpdate(userId, { interviewTaken }, { new: true })

        res.status(200).json({
            success:true,
            message: "Interview status updated",
            updatedUserData
        })
    }catch(err){
        console.error("❌ Error updating interview status:", err.stack || err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }

}

module.exports = {checkInterviewTaken, updateInterviewStatus}