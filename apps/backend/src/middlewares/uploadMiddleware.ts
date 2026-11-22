import fs from 'fs';
import path from 'path';
import { RequestHandler } from 'express';
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

const uploadReceiptFields = multer({
  storage: createStorage(RECEIPTS_DIR),
  fileFilter,
  limits,
}).fields([
  { name: 'paymentProof', maxCount: 1 },
  { name: 'receipt', maxCount: 1 },
]);

export const uploadReceipt: RequestHandler = (req, res, next) => {
  uploadReceiptFields(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    if (req.files) {
      const files = req.files as Record<string, Express.Multer.File[]>;
      req.file = files?.paymentProof?.[0] || files?.receipt?.[0];
    }
    next();
  });
};

export const uploadBanner = multer({
  storage: createStorage(BANNERS_DIR),
  fileFilter,
  limits,
}).single('banner');
