import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import lusca from "lusca";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./router/userRouter.js";
import messageRouter from "./router/messageRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";

const app = express();

config({ path: "./config/config.env" });

// CORS setup
app.use(
  cors({
    origin: [process.env.FRONTEND_PATIENT, process.env.FRONTEND_ADMIN],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Cookie parser
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000,      
      httpOnly: true,               
      secure: process.env.NODE_ENV === "production"  
    }
  })
);


// CSRF protection
app.use(lusca.csrf());

// Optional: Security headers
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  })
);

// Routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);

// Database connection
dbConnection();

// Error handling middleware
app.use(errorMiddleware);

export default app;
