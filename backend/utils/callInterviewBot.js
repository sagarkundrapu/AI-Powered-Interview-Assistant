const dotenv = require("dotenv");
const fetch = require("node-fetch");
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
    conversation.push({ role: "assistant", content: lastQuestion });

    res.status(200).json({success: true, content: lastQuestion});
  } catch (err) {
    console.error("❌ Error generating question:", err);
    res.status(500).json({success: false, message: "Error while generating a question"});
  }
};

const verifyResponse = async function (req, res) {
    const question = req.question;
    const answer = req.answer;
    if (!question) {
      res.status().json({
          success: false,
          message: "No question in request body"
      })
    }

    // Construct a minimal message array for rating
    const ratingPrompt = [
      { role: "system", content: "You are an expert interviewer. Rate the user's answer to the question below on a scale of 0 to 100. Respond only with a number." },
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
    const rating = parseInt(ratingText.match(/\d+/)?.[0] || "0");

    // Save to DB
    const record = {
      question: lastQuestion,
      answer,
      correctness: rating,
      timeTaken: 0 // optional
    };

    await Interview.findByIdAndUpdate(
      userId,
      { $push: { responses: [record] } },
      { upsert: true, new: true }
    );

    return { question: lastQuestion, answer, correctness: rating };
  } catch (err) {
    console.error("❌ Error verifying response:", err);
    throw err;
  }
};

module.exports = { askQuestion, verifyResponse };