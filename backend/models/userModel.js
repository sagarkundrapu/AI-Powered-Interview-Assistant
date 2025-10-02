const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'],required:true, default: 'student' },
    interviewTaken:{
        type: Boolean,
        default: false,
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
    }
});

// Remove interview field if role is 'admin'
//Mongoose hooks run before .save() or .create() operations.
//Setting a field to undefined in a pre('save') hook removes it from the final persisted document
//avoiding the need for dynamic schema definitions, which Mongoose doesn’t support

userSchema.pre('save', function (next) {
  if (this.role === 'admin') {
    this.interview = undefined;
    this.interviewTaken = undefined;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
