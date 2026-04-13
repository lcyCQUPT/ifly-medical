import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
export const UPLOAD_ERROR = '仅支持 jpg/png/pdf 格式，且文件大小不超过 10MB';

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads/visits', String(req.params.id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const decoded = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(decoded);
    const base = path.basename(decoded, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.includes(file.mimetype) ? cb(null, true) : cb(new Error(UPLOAD_ERROR));
  },
}).single('file');
