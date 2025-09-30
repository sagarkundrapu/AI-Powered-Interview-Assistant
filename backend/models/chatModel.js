const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timeTaken: { type: Number, required: true }, // in seconds
  correctness: { type: Number, required: true } // percentage (0–100)
});

const interviewSchema = new mongoose.Schema({
  responses: {
    type: [responseSchema] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);