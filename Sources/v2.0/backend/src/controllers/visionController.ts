import type { Request, Response } from 'express';
import { z } from 'zod';
import { detectObjectsFromImage } from '../services/visionService';
import type { DetectResponse } from '../types/vision';

const DetectBodySchema = z.object({
  imageBase64: z.string().min(10).optional(),
  allowedLabels: z.array(z.string()).optional(),
  imageWidth: z.number().int().positive().optional(),
  imageHeight: z.number().int().positive().optional(),
  topN: z.number().int().min(1).max(50).optional(),
});

function decodeBase64Image(input: string): Buffer {
  const raw = input.includes('base64,') ? input.split('base64,').pop() ?? '' : input;
  return Buffer.from(raw, 'base64');
}

export async function detectController(req: Request, res: Response) {
  try {
    const parsed = DetectBodySchema.safeParse(req.body ?? {});

    let imageBytes: Buffer | null = null;
    let allowedLabels: string[] | undefined;
    let imageWidth: number | undefined;
    let imageHeight: number | undefined;
    let topN: number | undefined;

    if (parsed.success) {
      allowedLabels = parsed.data.allowedLabels;
      imageWidth = parsed.data.imageWidth;
      imageHeight = parsed.data.imageHeight;
      topN = parsed.data.topN;
      if (parsed.data.imageBase64) {
        imageBytes = decodeBase64Image(parsed.data.imageBase64);
      }
    }

    // multipart/form-data: field "image"
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!imageBytes && file?.buffer) {
      imageBytes = file.buffer;
    }

    if (!imageBytes || imageBytes.length < 10) {
      const out: DetectResponse = {
        success: false,
        objects: [],
        message: 'No image provided. Send {imageBase64} JSON or multipart field "image".',
      };
      return res.status(400).json(out);
    }

    const opts: any = {};
    if (allowedLabels !== undefined) opts.allowedLabels = allowedLabels;
    if (imageWidth !== undefined) opts.imageWidth = imageWidth;
    if (imageHeight !== undefined) opts.imageHeight = imageHeight;
    if (topN !== undefined) opts.topN = topN;

    const result = await detectObjectsFromImage(imageBytes, opts);
    const out: DetectResponse = { success: true, objects: result.objects, best: result.best };
    return res.json(out);
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500;
    const out: DetectResponse = {
      success: false,
      objects: [],
      message: status === 429 ? 'Rate limit exceeded. Try again later.' : (e?.message || 'Unexpected error'),
    };
    return res.status(status).json(out);
  }
}

