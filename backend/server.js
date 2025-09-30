const express = require ("express")
const dotenv = require ("dotenv")
const connectToDB = require("./config/dbConfig.js")
const authRoutes =require("./routes/authRoute.js")
const homeRoutes =require("./routes/homeRoutes.js")


const app = express()
dotenv.config()

const PORT = process.env.PORT || 3000

//database connection
connectToDB()

//middlewares
app.use(express.json());


app.use("/api/auth",authRoutes);


//middleware protected routes
app.use("/api/home", homeRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



