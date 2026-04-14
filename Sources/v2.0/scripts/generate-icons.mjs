/**
 * Regenera los iconos en icons/ a partir de una imagen maestra cuadrada.
 *
 * Orden de búsqueda de la fuente:
 *   1) icons/icon-source.png   (recomendado: 1024×1024, PNG)
 *   2) icons/icon-source.webp
 *   3) ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
 *
 * Salida: icons/icon-{48,72,96,128,192,256,512}.webp y public/favicon.png (48×48).
 */
import sharp from 'sharp';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const iconsDir = join(root, 'icons');
const publicDir = join(root, 'public');

const WEBP_SIZES = [48, 72, 96, 128, 192, 256, 512];

function resolveSourcePath() {
  const candidates = [
    join(iconsDir, 'icon-source.png'),
    join(iconsDir, 'icon-source.webp'),
    join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const source = resolveSourcePath();
  if (!source) {
    console.error(
      'No se encontró imagen fuente. Coloca icons/icon-source.png (cuadrada, ideal 1024×1024) o icon-source.webp,'
    );
    console.error('o asegúrate de existir ios/.../AppIcon-512@2x.png');
    process.exit(1);
  }

  console.log('Fuente:', source);

  for (const size of WEBP_SIZES) {
    const out = join(iconsDir, `icon-${size}.webp`);
    await sharp(source)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(out);
    console.log('Generado', out);
  }

  const faviconPath = join(publicDir, 'favicon.png');
  await sharp(source).resize(48, 48, { fit: 'cover' }).png().toFile(faviconPath);
  console.log('Generado', faviconPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
