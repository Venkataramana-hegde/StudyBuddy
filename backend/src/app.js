import express from "express";
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import routes from "./routes.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

connectDB();    

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended:true, limit:"10mb"}));

app.use("/", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})
