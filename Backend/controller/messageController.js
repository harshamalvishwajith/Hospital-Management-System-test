import { Message } from "../models/messageSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import validator from "validator";

// Advanced input sanitization with multiple layers
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    let sanitized = input.normalize('NFC').trim();
    
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    sanitized = validator.escape(sanitized);
    
    sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
    
    return sanitized;
};

// Advanced email validation with additional security checks
const validateSecureEmail = (email) => {
    if (typeof email !== 'string') return null;
    
    if (!validator.isEmail(email)) return null;
    
    const ascii = /^[\x00-\x7F]*$/.test(email);
    if (!ascii) {
        const suspiciousChars = /[\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/;
        if (suspiciousChars.test(email)) return null;
    }
    
    return validator.normalizeEmail(email, {
        all_lowercase: true,
        gmail_lowercase: true,
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        gmail_convert_googlemaildotcom: false,
        outlookdotcom_lowercase: true,
        outlookdotcom_remove_subaddress: false,
        yahoo_lowercase: true,
        yahoo_remove_subaddress: false,
        icloud_lowercase: true,
        icloud_remove_subaddress: false
    });
};

// Get client IP with proper handling of proxies
const getClientIP = (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '0.0.0.0';
};

// Rate limiting check per IP
const ipRequestCount = new Map();
const IP_RATE_LIMIT = 10; 
const IP_WINDOW = 60 * 60 * 1000; 

const checkIPRateLimit = (ip) => {
    const now = Date.now();
    const requests = ipRequestCount.get(ip) || [];
    
    const validRequests = requests.filter(time => now - time < IP_WINDOW);
    
    if (validRequests.length >= IP_RATE_LIMIT) {
        return false;
    }
    
    validRequests.push(now);
    ipRequestCount.set(ip, validRequests);
    return true;
};

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
        return next(new ErrorHandler("Please Fill Full Form", 400))
    }

    // Get client information for security tracking
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent') || '';

    // Additional IP-based rate limiting
    if (!checkIPRateLimit(clientIP)) {
        return next(new ErrorHandler("Too many messages from this IP address. Please try again later.", 429));
    }

    // Enhanced email validation
    const safeEmail = validateSecureEmail(email);
    if (!safeEmail) {
        return next(new ErrorHandler("Please provide a valid email address", 400));
    }

    // Enhanced phone validation with additional checks
    const cleanPhone = phone.replace(/\D/g, ''); 
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
        return next(new ErrorHandler("Phone number must contain exactly 10 digits", 400));
    }

    // Check for suspicious patterns in phone (repeated digits, sequential)
    if (/(\d)\1{7,}/.test(cleanPhone) || cleanPhone === '1234567890' || cleanPhone === '0987654321') {
        return next(new ErrorHandler("Please provide a valid phone number", 400));
    }

    // Sanitize inputs with advanced protection
    const sanitizedData = {
        firstName: sanitizeInput(firstName),
        lastName: sanitizeInput(lastName),
        email: safeEmail,
        phone: cleanPhone,
        message: sanitizeInput(message),
        ipAddress: clientIP,
        userAgent: userAgent.substring(0, 512) 
    };

    if (sanitizedData.firstName.length < 2 || sanitizedData.firstName.length > 30) {
        return next(new ErrorHandler("First name must be between 2 and 30 characters", 400));
    }
    if (sanitizedData.lastName.length < 2 || sanitizedData.lastName.length > 30) {
        return next(new ErrorHandler("Last name must be between 2 and 30 characters", 400));
    }
    if (sanitizedData.message.length < 10 || sanitizedData.message.length > 500) {
        return next(new ErrorHandler("Message must be between 10 and 500 characters", 400));
    }

    try {
        await Message.create(sanitizedData);
        res.status(200).json({
            success: true,
            message: "Message sent successfully!"
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to send message. Please check your input and try again.", 400));
    }
})


export const getAllMessages = catchAsyncErrors(async(req,res,next)=>{
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages
    })

})