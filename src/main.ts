// shim entrypoint: delegate to `main_clean.ts` which contains the real bootstrap logic.
// Keeping this minimal avoids TypeScript parsing the previously corrupted content.
import './main_clean'


