import { env } from '../config/env';

export type AzureBoundingBox = { x: number; y: number; w: number; h: number };
export type AzureObject = { name: string; confidence: number; boundingBox: AzureBoundingBox };

export type AzureObjectsResult = {
  objectsResult?: { values?: AzureObject[] };
};

function joinUrl(base: string, path: string): string {
  return base.replace(/\/+$/, '') + path;
}

export async function analyzeImageObjects(imageBytes: Buffer): Promise<AzureObject[]> {
  const url = joinUrl(
    env.AZURE_VISION_ENDPOINT,
    `/imageanalysis:analyze?api-version=${encodeURIComponent(env.AZURE_VISION_API_VERSION)}&features=objects`
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': env.AZURE_VISION_KEY,
      'Content-Type': 'application/octet-stream',
    },
    // Node fetch expects BodyInit; Buffer is OK at runtime but TS needs ArrayBufferView
    body: new Uint8Array(imageBytes),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Azure Vision error ${res.status}: ${text || res.statusText}`);
    (err as any).status = res.status;
    throw err;
  }

  const data = (await res.json()) as AzureObjectsResult;
  return data.objectsResult?.values ?? [];
}

