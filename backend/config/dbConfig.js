const dotenv = require("dotenv")
const mongoose = require("mongoose");

dotenv.config()

const MONGO_URI = process.env.MONGO_URI;

const connectToDB= async()=>{
    try{
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB database");
    }catch(e){
        console.error("Error connecting to MongoDB", e);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectToDB;