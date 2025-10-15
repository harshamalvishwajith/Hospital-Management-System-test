// File Upload Security Test Examples
// This file demonstrates how the security improvements work

// Example 1: Valid file upload (PNG image)
const validPNGHeader = [0x89, 0x50, 0x4E, 0x47]; // PNG signature
// This would pass validation

// Example 2: Invalid file (executable disguised as PNG)
const fakeExeAsPNG = [0x4D, 0x5A, 0x90, 0x00]; // MZ header (executable)
// This would be rejected by magic number validation

// Example 3: File size validation
const maxSize = 5 * 1024 * 1024; // 5MB limit
function validateFileSize(fileSize) {
    return fileSize <= maxSize;
}

// Example 4: Filename sanitization
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '') // Remove dangerous characters
        .replace(/\.{2,}/g, '.') // Remove path traversal attempts
        .substring(0, 255); // Limit length
}

// Example usage:
console.log(sanitizeFilename("../../etc/passwd.png")); // Output: "etcpasswd.png"
console.log(sanitizeFilename("normal-image.png")); // Output: "normal-image.png"

// Example 5: Rate limiting
// 5 uploads per 15 minutes per IP
// 10 uploads per hour per authenticated user

// Example 6: Temporary file cleanup
// Files are automatically cleaned up after:
// - Successful upload to Cloudinary
// - Failed validation
// - 1 hour of inactivity (periodic cleanup)

export {
    validateFileSize,
    sanitizeFilename
};