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
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "Invalid user...user is not shortlisted for interview"});
        }

        //check entered password with db password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success: false, message: "Invalid password...check your password again"});
        }

        //generate a jwt token and send it to the user
        const payload = { userId: user._id, username: user.username, email: user.email, role: user.role, interviewTaken: user.interviewTaken };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: `${process.env.TOKEN_EXPIRATION_IN_HRS}h` });

        res.status(200).json({success: true, message: "User logged in successfully", token});

    }catch(e){
        console.error("Some error occured while logging in user",e);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

module.exports = { registerUser, loginUser };