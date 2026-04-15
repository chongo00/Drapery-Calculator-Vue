import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4100),
  CORS_ORIGIN: z.string().optional(),
  AZURE_VISION_ENDPOINT: z.string().url(),
  AZURE_VISION_KEY: z.string().min(10),
  AZURE_VISION_API_VERSION: z.string().default('2024-02-01').transform((v) => {
    // Some environments may still inject deprecated preview versions.
    return v === '2023-04-01-preview' ? '2024-02-01' : v;
  }),
  VISION_ALLOWED_LABELS: z.string().default('window'),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);

export function getAllowedLabels(): string[] {
  return env.VISION_ALLOWED_LABELS.split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

