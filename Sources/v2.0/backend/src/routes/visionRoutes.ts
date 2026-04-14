import { Router } from 'express';
import multer from 'multer';
import { detectController } from '../controllers/visionController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const visionRouter = Router();

visionRouter.post('/detect', upload.single('image'), detectController);

