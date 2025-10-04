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
        interviewScore: user.interviewScore,
        interview: user.interviewTaken && user.interview ? user.interview.responses : []
      },

    });
  } catch (err) {
    console.error("❌ Error fetching summary:", err.stack || err);
    res.status(500).json({ success: false, message: "Internal server error...summary of the interview can't be fetched" });
  }
}


//working
const getStudentsList = async (req, res) => {

  const filter = req.params.filter || 'registered';       //whether to select registered users, users who have taken interview or those who haven't

  // GET http://localhost:5000/api/your-route?pageNumber=1
  const pageNumber = Math.max(1, parseInt(req.query.pageNumber) || 1);    //avoiding negative pagenumbers
  const entries = parseInt(process.env.RECORDS_PER_PAGE) || 5;
  const recordsToSkip = (pageNumber - 1) * entries;

  let filterQuery = null;

  if (filter === 'interviewTaken') {
    filterQuery = {
      interviewTaken: true,
      role: 'student'
    }
  } else if (filter === 'interviewNotTaken') {
    filterQuery = {
      interviewTaken: false,
      role: 'student'
    }
  } else {
    //no filter selected, display all students
    filterQuery = {
      role: 'student'
    }
  }


  try {
    const totalMatchedRecords = await User.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalMatchedRecords / entries)


    //if no records match, totalPages will be 0, but we are forcing pageNumber ≥ 1, so gracefully handle empty results 
    if (totalMatchedRecords === 0) {
      return res.status(200).json({
        success: true,
        totalMatchedRecords: 0,
        totalPages: 0,
        users: []
      });
    }


    //pagination for descending order of interviewScores
    const users = await User.find(filterQuery)
      .select("_id username email interviewScore interviewTaken")
      .sort({ interviewScore: -1 })
      .skip(recordsToSkip).limit(entries);

    res.status(200).json({
      success: true,
      totalMatchedRecords,
      totalPages,
      currentPage: pageNumber,
      recordsPerPage: entries,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
      users
    });

  } catch (err) {
    console.error("❌ Error fetching students:", err.stack || err);
    res.status(500).json({
      success: false,
      message: "Internal server error...could not fetch attended students list"
    });
  }
};

module.exports = { getInterviewSummary, getStudentsList }


//learnings:
// - localhost:3000/api/dashboard/ → defaults to page 1
// - localhost:3000/api/dashboard?pageNumber=1 → explicitly page 1
// - localhost:3000/api/dashboard/?pageNumber=1 → same as above
//all three give same output
// const pageNumber = req.query.pageNumber;
// You're not validating or defaulting pageNumber properly. If pageNumber is undefined (as in the first URL), then this line:
// const recordsToSKip = (pageNumber - 1) * entries;
// will result in NaN, and .skip(NaN) effectively becomes .skip(0) — meaning no skipping happens, and you get the first page


