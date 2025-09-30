const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");

//success
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

// success
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

    const mimeType = getMimeType(filePath);
    let rawText = "";

    if (mimeType === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      rawText = data.text;
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    } else {
      return res.status(415).json({ success: false, message: "Unsupported file type" });
    }

    // Optional: delete file after parsing
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "Resume parsed successfully",
      text: normalizeText(rawText)
    });
  } catch (err) {
    console.error("❌ Error parsing resume:", err.stack || err);
    res.status(500).json({
      success: false,
      message: "Internal server error...resume could not be parsed"
    });
  }
};

// Helper to infer MIME type from extension
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return null;
}

// Optional normalization
function normalizeText(text) {
  return text.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = { uploadResume, parseResume };