require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];         //Beared xvz.....token

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized...no token found" });
    }

    //decode token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userInfo = decoded;
        next();
    }catch(err){
        return res.status(500).json({ success: false, message: "Error while decoding the token...token malformed" });
    }

    
};

module.exports = authMiddleware;