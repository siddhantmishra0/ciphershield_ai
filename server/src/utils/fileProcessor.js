import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage(); // Store in memory for processing

const fileFilter = (req, file, cb) => {
  const allowed = {
    text: ['.txt', '.pdf', '.docx', '.doc'],
    image: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
  };
  const ext = path.extname(file.originalname).toLowerCase();
  const allAllowed = [...allowed.text, ...allowed.image];
  if (allAllowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not supported`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter
});

export function isImageFile(originalname) {
  return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(
    path.extname(originalname).toLowerCase()
  );
}

export function isTextFile(originalname) {
  return ['.txt', '.pdf', '.docx', '.doc'].includes(
    path.extname(originalname).toLowerCase()
  );
}
