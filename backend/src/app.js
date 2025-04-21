import express from "express";
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import routes from "./routes.js";
import cors from 'cors';

dotenv.config();

const app = express();

connectDB();    

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended:true, limit:"10mb"}));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to StudyBuddy" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})
