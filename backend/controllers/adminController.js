const User = require("../models/userModel.js")

//working
const getInterviewSummary = async (req, res) => {
  const username = req.params.username

  try {
    const user = await User.findOne({username}).populate("interview");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        interviewTaken: user.interviewTaken
      },
      interview: user.interview ? user.interview.responses : []
    });
  } catch (err) {
    console.error("❌ Error fetching summary:", err.stack || err);
    res.status(500).json({ success: false, message: "Internal server error...summary of the interview can't be fetched" });
  }
}

//working
const getAttendedStudentsList = async (req, res) => {
  try {
    const users = await User.find({ interviewTaken: true }).select("username");

    const usernames = users.map(user => user.username);

    res.status(200).json({
      success: true,
      count: usernames.length,
      usernames
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

