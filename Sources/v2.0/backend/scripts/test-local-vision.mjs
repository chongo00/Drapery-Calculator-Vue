import fs from 'node:fs';
import path from 'node:path';

const IMAGES_DIR = process.argv[2] || 'C:\\\\Users\\\\chong\\\\Downloads\\\\ventanas';
const BASE_URL = process.argv[3] || 'http://127.0.0.1:4100';

function isImageFile(name) {
  const ext = path.extname(name).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext);
}

async function postImage(filePath) {
  const bytes = fs.readFileSync(filePath);
  const dataUrl = `data:image/${path.extname(filePath).slice(1)};base64,${bytes.toString('base64')}`;
  const res = await fetch(`${BASE_URL}/api/vision/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: dataUrl, allowedLabels: ['window'] }),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images dir not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter(isImageFile)
    .map((f) => path.join(IMAGES_DIR, f));

  if (files.length === 0) {
    console.error(`No images found in: ${IMAGES_DIR}`);
    process.exit(1);
  }

  console.log(`Testing ${files.length} images against ${BASE_URL} ...`);
  let ok = 0;
  for (const file of files) {
    const name = path.basename(file);
    try {
      const { status, json } = await postImage(file);
      const objects = json?.objects ?? [];
      const best = objects?.[0];
      const labels = Array.isArray(objects) ? objects.map((o) => `${o.label}(${Math.round((o.confidence ?? 0) * 100)}%)`) : [];
      const hasBox = !!best?.boundingBox;
      const msg = json?.message ? ` msg="${String(json.message).slice(0, 160)}"` : '';
      const line = `${name} -> ${status} objects=${objects.length} ${labels.join(', ')}${msg}`;
      console.log(line);
      if (status === 200 && hasBox) ok += 1;
    } catch (e) {
      console.log(`${name} -> ERROR ${(e && e.message) || e}`);
    }
  }
  console.log(`Done. Images with at least 1 bbox: ${ok}/${files.length}`);
}

main();

