const express = require ("express")
const dotenv = require ("dotenv")
const cors = require("cors"); 
const connectToDB = require("./config/dbConfig.js")
const authRoutes =require("./routes/authRoute.js")
const homeRoutes =require("./routes/homeRoutes.js")
const interviewRoutes = require("./routes/interviewRoutes.js");
const authMiddleware = require("./middlewares/authMiddleware.js");
const isAdmin = require("./middlewares/adminMiddleware.js")

const app = express()
dotenv.config()

const PORT = process.env.PORT || 3000

app.use(cors({
  origin: "*"
}));


//database connection
connectToDB()

//middlewares
app.use(express.json());


app.use("/api/auth",authRoutes);


//middleware protected routes
app.use("/api/home", authMiddleware, homeRoutes);
app.use("/api/interview", authMiddleware, interviewRoutes);
app.use("/api/dashboard", authMiddleware, isAdmin, adminRoutes)




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



