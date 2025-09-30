const dotenv = require("dotenv");
const fetch = require("node-fetch");
const User = require("../models/userModel.js")
const Interview = require("../models/chatModel.js")


dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "deepseek/deepseek-chat-v3.1:free";
const URL = "https://openrouter.ai/api/v1/chat/completions";

if (!API_KEY) {
  console.error("❌ OPENROUTER_API_KEY not set in .env");
  process.exit(1);
}

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};



let lastQuestion = null;

const askQuestion = async function (req, res) {
    const conversation = [
        { role: "system", content: "You are an AI interviewer. Ask one technical question related to full-stack development." }
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

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenRouter");
    }

    lastQuestion = data.choices[0].message.content;

    res.status(200).json({success: true, content: lastQuestion});
  } catch (err) {
    console.error("❌ Error generating question:", err.stack || err);
    res.status(500).json({success: false, message: "Error while generating a question"});
  }
};

const verifyResponse = async function (req, res) {
  const { email } = req.userInfo;
  const { question, answer, timeTaken = 0 } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: question or answer"
    });
  }

  const ratingPrompt = [
    {
      role: "system",
      content: "You are an expert interviewer. Rate the user's answer to the question below on a scale of 0 to 100. Respond only with a number no extra words."
    },
    { role: "assistant", content: question },
    { role: "user", content: answer }
  ];

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: ratingPrompt
      })
    });

    const data = await response.json();
    const ratingText = data.choices[0]?.message?.content || "0";
    const correctness = parseInt(ratingText.match(/\d+/)?.[0] || "0");

    const record = { question, answer, timeTaken, correctness };

    // Find user and populate interview reference
    const user = await User.findOne({ email }).populate("interview");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let interviewDoc = user.interview;

    // If no interview exists, create one and link it
    if (!interviewDoc) {
      interviewDoc = await Interview.create({ responses: [record] });
      user.interview = interviewDoc._id;
      await user.save();
    } else {
      interviewDoc.responses.push(record);
      await interviewDoc.save();
    }

    return res.status(200).json({
      success: true,
      message: "Answer analyzed and saved in db successfully"
    });
  } catch (err) {
    console.error("❌ Error verifying response:", err.stack || err);
    return res.status(500).json({
      success: false,
      message: "Internal server error...error from chatbot"
    });
  }
};

module.exports = { askQuestion, verifyResponse };