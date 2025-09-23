import express from "express"
import rateLimit from "express-rate-limit"
import { getAllMessages, sendMessage } from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Rate limiting specifically for message sending
const messageRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, 
    message: "Too many messages sent from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/send", messageRateLimit, sendMessage)
router.get("/getall", isAdminAuthenticated, getAllMessages)

export default router