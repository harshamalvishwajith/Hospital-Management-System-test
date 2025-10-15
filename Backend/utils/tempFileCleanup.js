import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Clean up old temporary files
export const cleanupOldTempFiles = async () => {
  const tempDir = '/tmp';
  const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
  
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      
      try {
        const stats = await fs.stat(filePath);
        const age = now - stats.mtime.getTime();
        
        // If file is older than maxAge and looks like a temp upload file
        if (age > maxAge && (file.startsWith('tmp-') || file.includes('upload'))) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old temp file: ${file}`);
        }
      } catch (error) {
        // File might have been deleted already, continue
        continue;
      }
    }
  } catch (error) {
    console.error('Error during temp file cleanup:', error);
  }
};

// Start periodic cleanup (runs every 30 minutes)
export const startTempFileCleanup = () => {
  // Clean up on startup
  cleanupOldTempFiles();
  
  // Set up periodic cleanup
  setInterval(cleanupOldTempFiles, 30 * 60 * 1000); // 30 minutes
  
  console.log('Temporary file cleanup service started');
};