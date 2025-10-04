const User = require("../models/userModel.js")
require('dotenv').config()

//working
const getInterviewSummary = async (req, res) => {
  const userId = req.params.userId

  try {
    const user = await User.findById(userId).populate("interview");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        interviewTaken: user.interviewTaken,
        interview: user.interviewTaken && user.interview ? user.interview.responses : []
      },
      
    });
  } catch (err) {
    console.error("❌ Error fetching summary:", err.stack || err);
    res.status(500).json({ success: false, message: "Internal server error...summary of the interview can't be fetched" });
  }
}


//working
const getAttendedStudentsList = async (req, res) => {

  // GET http://localhost:5000/api/your-route?pageNumber=1
  const pageNumber = Math.max(1, parseInt(req.query.pageNumber) || 1);    //avoiding negative pagenumbers
  const entries = parseInt(process.env.RECORDS_PER_PAGE) || 5;
  const recordsToSKip = (pageNumber-1)*entries;

  try {
    const totalMatchedRecords = await User.countDocuments({ interviewTaken: true });
    const totalPages= Math.ceil(totalMatchedRecords/entries)

    //pagination for descending order of interviewScores
    const users = await User.find({ interviewTaken: true })
    .select("username email interviewScore _id")
    .sort({ interviewScore: -1 })
    .skip(recordsToSKip).limit(entries); 

    res.status(200).json({
      success: true,
      totalMatchedRecords,
      totalPages,
      users
    });

  } catch (err) {
    console.error("❌ Error fetching attended students:", err.stack || err);
    res.status(500).json({
      success: false,
      message: "Internal server error...could not fetch attended students list"
    });
  }
};

module.exports = {getInterviewSummary, getAttendedStudentsList}


//learnings:
// - localhost:3000/api/dashboard/ → defaults to page 1
// - localhost:3000/api/dashboard?pageNumber=1 → explicitly page 1
// - localhost:3000/api/dashboard/?pageNumber=1 → same as above
//all three give same output
// const pageNumber = req.query.pageNumber;
// You're not validating or defaulting pageNumber properly. If pageNumber is undefined (as in the first URL), then this line:
// const recordsToSKip = (pageNumber - 1) * entries;
// will result in NaN, and .skip(NaN) effectively becomes .skip(0) — meaning no skipping happens, and you get the first page


