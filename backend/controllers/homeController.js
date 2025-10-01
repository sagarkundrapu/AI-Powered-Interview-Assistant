const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const dotenv = require("dotenv");
const User = require("../models/userModel.js")
const Interview = require("../models/chatModel.js")


dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL
const URL = process.env.URL;

if (!API_KEY) {
  console.error("❌ OPENROUTER_API_KEY not set in .env");
  process.exit(1);
}

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};


//success
const uploadAndParseResume = async(req, res) => {
  const { userId, username, role, interviewTaken } = req.userInfo;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const storedName = req.file.filename

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
    const normalizedText = normalizeText(rawText);
    const userDetails = await extractUserDetails(normalizedText);


    res.status(200).json({
      success: true,
      message: `Resume uploaded and parsed successfully by ${username}`,
      text: normalizedText,
      userDetails
    });

  } catch (err) {
    console.error("❌ Error parsing resume:", err.stack || err);
    res.status(500).json({
      success: false,
      message: "Internal server error...resume could not be parsed"
    });
  }
};


//extract user details from resume
async function extractUserDetails (text) {

  if (!text || typeof text !== "string") {
    return res.status(400).json({ success: false, message: "Missing or invalid resume text" });
  }

  const conversation = [
    {
    role: "system",
    content: `You are an intelligent resume parser. Extract the candidate's full name, email address, and phone number from the following resume text. 
              Respond only with a valid JSON object in this format:
              {
                "name": "Full Name",
                "email": "Email Address",
                "phone": "Phone Number"
              }
              Do not include any extra text, explanation, or labels. 
              If any field is missing, use "Not found". 
              Ensure the email and phone are cleanly extracted without trailing words like "Mobile" or "Email".`
    },
    {
      role: "user",
      content: text // normalized resume text
    }
  ];

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: conversation
      })
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;

    let userDetails = {};
    try {
      userDetails = JSON.parse(raw);
    } catch (parseErr) {
      console.error("❌ Failed to parse model response:", raw);
      return res.status(500).json({ success: false, message: "Model returned invalid JSON" });
    }

    return userDetails;
  } catch (err) {
    console.error("❌ Error extracting user details:", err.stack || err);
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

module.exports =  uploadAndParseResume ;