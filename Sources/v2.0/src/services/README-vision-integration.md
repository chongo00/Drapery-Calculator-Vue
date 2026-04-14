# Azure Vision + AR measurement (v2.0)

## Frontend env

Set in `Sources/v2.0/.env`:

- `VITE_VISION_BACKEND_URL=http://<ip>:4100` (your backend host)

## Flow in `OCRPage`

- Live camera uses `getUserMedia` (back camera).
- Every ~400ms a downscaled JPEG frame is sent to backend `POST /api/vision/detect`.
- The best `window` detection becomes the live green frame overlay.
- When user presses **Capture**, the app:
  - uses the latest detected rectangle
  - reads AR distance + intrinsics from `@blindsbook/ar-measure`
  - computes real size (cm/in) with pinhole approximation: \(meters \approx pixels \times distance / f_x\)
  - shows measurements and offers **Send to calculator** (Tab1)

Notes:
- If AR is unavailable/tracking is limited, the app falls back to the existing approximate scaling setting.

