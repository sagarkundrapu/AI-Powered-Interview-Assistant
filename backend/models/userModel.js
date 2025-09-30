const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'],required:true, default: 'user' },
    interviewTaken:{
        type: Boolean,
        default: false,
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
    }
});

module.exports = mongoose.model('User', userSchema);
