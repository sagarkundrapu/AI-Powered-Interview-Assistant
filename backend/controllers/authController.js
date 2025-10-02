const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

require("dotenv").config();

//success
const registerUser = async(req, res) => {
    try{
        const { username, email, password, role } = req.body;

        const checkExistingUser= await User.findOne({$or: [{username}, {email}]});
        if(checkExistingUser){
            return res.status(400).json({success: false, message: "User already registered"});
        }

        //hash the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //save user details in db
        const newUser = new User({ username, email, password: hashedPassword, role});
        await newUser.save();
        res.status(201).json({success: true, message: "User registered successfully"});

    }catch(e){
        console.error("Some error occured while registering user",e);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

//success
const loginUser = async(req, res) => {
    try{
        //user verification
        const { role, email, password } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "Invalid user"});
        }

        //check entered password with db password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success: false, message: "Invalid login credentials"});
        }

        //check if role matches
        if(role !== user.role){
            return res.status(403).json({success:false, message: "Access denied...kindly login with your assigned role"})
        }

        //generate a jwt token and send it to the user: default token expiration=3hrs
        const payload = { userId: user._id, username: user.username, email: user.email, role: user.role};
        //if student logs in, include interview status in payload
        if(user.role === "student"  && typeof user.interviewTaken !== 'undefined'){
            payload.interviewTaken = user.interviewTaken;

        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: `${process.env.TOKEN_EXPIRATION_IN_HRS || 3}h` });

        res.status(200).json({success: true, message: "User logged in successfully", token});

    }catch(e){
        console.error("Some error occured while logging in user",e);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

module.exports = { registerUser, loginUser };