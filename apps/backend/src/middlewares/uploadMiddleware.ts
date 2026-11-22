import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const ROOT_DIR = process.env.ROOT_DIR || path.resolve(process.cwd());
const UPLOADS_DIR = process.env.UPLOADS_DIR || (fs.existsSync(path.join(ROOT_DIR, 'uploads')) ? path.join(ROOT_DIR, 'uploads') : path.resolve(process.cwd(), '../../uploads'));
const RECEIPTS_DIR = path.join(UPLOADS_DIR, 'receipts');
const BANNERS_DIR = path.join(UPLOADS_DIR, 'banners');

// Ensure upload directories exist
fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
fs.mkdirSync(BANNERS_DIR, { recursive: true });

const createStorage = (targetDir: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueFilename = `${Date.now()}-${uuidv4()}${ext}`;
      cb(null, uniqueFilename);
    },
  });
};

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipe file tidak didukung: ${file.mimetype}. Hanya format JPEG, PNG, dan PDF yang diperbolehkan.`
      )
    );
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

export const uploadReceipt = multer({
  storage: createStorage(RECEIPTS_DIR),
  fileFilter,
  limits,
}).single('paymentProof');

export const uploadBanner = multer({
  storage: createStorage(BANNERS_DIR),
  fileFilter,
  limits,
}).single('banner');
