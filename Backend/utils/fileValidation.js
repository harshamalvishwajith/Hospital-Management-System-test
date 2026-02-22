import fs from 'fs/promises';
import path from 'path';

// File type validation using magic numbers (file signatures)
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Validate file type using magic numbers
export const validateFileType = async (filePath, expectedMimeType) => {
  try {
    const buffer = await fs.readFile(filePath);
    const signature = FILE_SIGNATURES[expectedMimeType];
    
    if (!signature) {
      return false;
    }
    
    // Check if file starts with expected signature
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('File validation error:', error);
    return false;
  }
};

// Validate file size
export const validateFileSize = (fileSize) => {
  return fileSize <= MAX_FILE_SIZE;
};

// Sanitize filename
export const sanitizeFilename = (filename) => {
  // Remove any path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

// Basic malware pattern detection (simple patterns)
export const basicMalwareCheck = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const content = buffer.toString('hex');
    
    // Check for common malware signatures (basic detection)
    const suspiciousPatterns = [
      '4d5a', // MZ header (executable)
      '504b0304', // ZIP header (potential malware container)
      '7f454c46', // ELF header (Linux executable)
      '89504e47', // PNG header with script injection patterns
    ];
    
    // Look for executable patterns in what should be image files
    const executablePatterns = ['4d5a90', '504b0304'];
    for (const pattern of executablePatterns) {
      if (content.includes(pattern)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Malware check error:', error);
    return false;
  }
};

// Clean up temporary files
export const cleanupTempFile = async (filePath) => {
  try {
    if (filePath && await fs.access(filePath).then(() => true).catch(() => false)) {
      await fs.unlink(filePath);
      console.log('Temporary file cleaned up:', filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temporary file:', error);
  }
};

// Comprehensive file validation
export const validateUploadedFile = async (file) => {
  const errors = [];
  
  // Check if file exists
  if (!file || !file.tempFilePath) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  // Validate file size
  if (!validateFileSize(file.size)) {
    errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    errors.push('File type not supported. Only PNG, JPEG, and WebP images are allowed');
  }
  
  // Validate actual file type using magic numbers
  const isValidFileType = await validateFileType(file.tempFilePath, file.mimetype);
  if (!isValidFileType) {
    errors.push('File content does not match declared file type');
  }
  
  // Basic malware check
  const isSafe = await basicMalwareCheck(file.tempFilePath);
  if (!isSafe) {
    errors.push('File failed security scan');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};