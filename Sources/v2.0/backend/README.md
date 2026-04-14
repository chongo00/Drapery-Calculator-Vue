# Vision Backend (Azure AI Vision) — Drapery Calculator v2.0

This service receives camera frames and returns object detections (bounding boxes) using **Azure AI Vision Image Analysis 4.0**.

The mobile app computes real-world measurements (cm/in) on-device using ARKit/ARCore; this backend only returns boxes.

## Endpoints

### `POST /api/vision/detect`

Accepts either:

- **JSON**: `{ "imageBase64": "data:image/jpeg;base64,...", "allowedLabels": ["window"] }`
- **multipart/form-data**: field `image` as a file upload.

Response:

```json
{
  "success": true,
  "objects": [
    {
      "label": "window",
      "confidence": 0.92,
      "boundingBox": { "x": 120, "y": 80, "width": 340, "height": 220 },
      "estimatedSize": null
    }
  ]
}
```

## Configuration

Copy `.env.example` to `.env` and fill:

- `AZURE_VISION_ENDPOINT`: e.g. `https://<resource>.cognitiveservices.azure.com`
- `AZURE_VISION_KEY`: key from Azure Portal
- `VISION_ALLOWED_LABELS`: CSV labels to keep, default `window`
- `CORS_ORIGIN`: your Ionic dev origin, e.g. `http://localhost:8100`

## Run

```bash
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:4100/health
```

## How to get Azure Vision credentials

1. Azure Portal → **Create a resource**
2. Search for **Azure AI services** → **Azure AI Vision** (Computer Vision)
3. Create resource (choose region and pricing tier)
4. Resource → **Keys and Endpoint** → copy **KEY 1** and **Endpoint**

Docs:
- Pricing: `https://azure.microsoft.com/pricing/details/cognitive-services/computer-vision/`
- API (Image Analysis 4.0): `https://learn.microsoft.com/azure/ai-services/computer-vision/how-to/call-analyze-image-40`

