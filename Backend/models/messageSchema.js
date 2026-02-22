import mongoose from "mongoose"
import validator from "validator"

const phoneValidator = {
    validator: function(v) {
        return /^[0-9]{10}$/.test(v);
    },
    message: "Phone number must contain exactly 10 digits!"
};

// Advanced XSS and content security validator
const securityValidator = {
    validator: function(v) {
        if (!v || typeof v !== 'string') return false;
        
        const normalizedValue = v.normalize('NFC');
        
        // Check for various XSS patterns (comprehensive)
        const xssPatterns = [
            /<script[\s\S]*?>[\s\S]*?<\/\s*script[\s\S]*?>/gi,
            /<iframe[\s\S]*?>[\s\S]*?<\/\s*iframe[\s\S]*?>/gi,
            /<object[\s\S]*?>[\s\S]*?<\/\s*object[\s\S]*?>/gi,
            /<embed[\s\S]*?>/gi,
            /<link[\s\S]*?>/gi,
            /<meta[\s\S]*?>/gi,
            /<style[\s\S]*?>[\s\S]*?<\/\s*style[\s\S]*?>/gi,
            /<form[\s\S]*?>/gi,
            /<input[\s\S]*?>/gi,
            /<textarea[\s\S]*?>/gi,
            /<button[\s\S]*?>/gi,
            /<img[\s\S]*?src[\s\S]*?javascript:/gi,
            /<[^>]*?\s*javascript\s*:/gi,
            /<[^>]*?\s*vbscript\s*:/gi,
            /<[^>]*?\s*data\s*:\s*text\/html/gi,
            /<[^>]*?\s*on\w+\s*=/gi,
            /javascript\s*:/gi,
            /vbscript\s*:/gi,
            /data\s*:\s*text\/html/gi,
            /expression\s*\(/gi,
            /url\s*\(/gi,
            /import\s*\(/gi,
            /eval\s*\(/gi,
            /function\s*\(/gi,
            /alert\s*\(/gi,
            /confirm\s*\(/gi,
            /prompt\s*\(/gi,
        ];
        
        // Check for SQL/NoSQL injection patterns
        const injectionPatterns = [
            /\$where/gi,
            /\$ne/gi,
            /\$gt/gi,
            /\$lt/gi,
            /\$regex/gi,
            /\$or/gi,
            /\$and/gi,
        ];
        
        // Check for malicious patterns
        for (const pattern of [...xssPatterns, ...injectionPatterns]) {
            if (pattern.test(normalizedValue)) {
                return false;
            }
        }
        
        // Check for excessive repeated characters (potential DoS)
        if (/(.)\1{50,}/.test(normalizedValue)) {
            return false;
        }
        
        // Check for suspicious HTML entities
        if (/&#x?[0-9a-f]+;/gi.test(normalizedValue)) {
            return false;
        }
        
        return true;
    },
    message: "Content contains potentially malicious or unsafe patterns!"
};

// Name validator for additional security
const nameValidator = {
    validator: function(v) {
        if (!v || typeof v !== 'string') return false;
        
        // Normalize Unicode
        const normalizedValue = v.normalize('NFC');
        
        // Allow only letters, spaces, hyphens, and apostrophes
        return /^[a-zA-Z\s\-']+$/.test(normalizedValue);
    },
    message: "Name contains invalid characters!"
};

const messageSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength:[2, "First Name must contain at least 2 characters!"],
        maxLength:[30, "First Name cannot exceed 30 characters!"],
        trim: true,
        validate: nameValidator
    },
    lastName:{
        type: String,
        required: true,
        minLength:[2, "Last Name must contain at least 2 characters!"],
        maxLength:[30, "Last Name cannot exceed 30 characters!"],
        trim: true,
        validate: nameValidator
    },
    email:{
        type: String,
        required: true,
        validate : [validator.isEmail, "Please provide a valid Email!"],
        lowercase: true,
        trim: true,
        maxLength: [254, "Email cannot exceed 254 characters!"] 
    },
    phone:{
        type: String,
        required: true,
        validate: phoneValidator,
        match: [/^[0-9]{10}$/, "Phone number format is invalid!"]
    },
    message:{
        type: String,
        required: true,
        minLength:[10, "Message must contain at least 10 characters!"],
        maxLength:[500, "Message cannot exceed 500 characters!"], 
        validate: securityValidator,
        trim: true
    },
    // Add IP tracking for security monitoring
    ipAddress: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true; 
                return validator.isIP(v);
            },
            message: "Invalid IP address format!"
        }
    },
    userAgent: {
        type: String,
        required: false,
        maxLength: [512, "User agent string too long!"],
        validate: {
            validator: function(v) {
                if (!v) return true; 
                // Basic validation to prevent injection
                return !/[<>\"']/g.test(v);
            },
            message: "Invalid user agent format!"
        }
    }
}, {
    timestamps: true,
    index: { createdAt: 1 }
})

export const Message = mongoose.model("Message",messageSchema)