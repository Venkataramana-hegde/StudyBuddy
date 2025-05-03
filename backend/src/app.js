import express from "express";
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import routes from "./routes.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUploadRoute from "./services/fileUpload.route.js"

dotenv.config();

const app = express();

connectDB();    

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended:true, limit:"10mb"}));

app.use("/", routes);
app.use("/api/file", fileUploadRoute);
app.use((re, res, next) => {
  req.io = io;
  next();
})

export default app;
