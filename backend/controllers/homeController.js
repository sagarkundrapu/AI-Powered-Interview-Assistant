const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs");

const uploadResume = async(req, res) => {
  const { userId, username, role, interviewTaken } = req.userInfo;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  res.status(200).json({
    success: true,
    message: `Resume uploaded successfully by ${username}`,
    file: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      path: req.file.path
    },
    user: { userId, username, role, interviewTaken }
  });
}

const parseResume = async (req, res) => {
  const { storedName } = req.body;

  if (!storedName) {
    return res.status(400).json({ success: false, message: "Missing stored filename" });
  }

  const filePath = path.join(__dirname, "..", "uploads", storedName);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    const result = await mammoth.extractRawText({ path: filePath });

    // Optional: delete file after parsing
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "Resume parsed successfully",
      text: result.value
    });
  } catch (err) {
    console.error("❌ Error parsing resume:", err.stack || err);
    res.status(500).json({
      success: false,
      message: "Internal server error...resume could not be parsed"
    });
  }
}

module.exports = { uploadResume, parseResume }