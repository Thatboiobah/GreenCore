# GreenCore ML Model Integration (Research + Planning)

This document captures a practical, implementation-ready plan for integrating an AI/ML image model into GreenCore so that an uploaded crop photo can produce:

- Healthy vs diseased
- Disease name (if diseased)
- Confidence
- Severity
- Solution (treatment)
- Future prevention
- Meaningful, actionable insights

It also outlines how to connect this end-to-end across:

- Frontend (React/Vite)
- Backend (Node/Express)
- Database + storage (Supabase)
- ML inference service (recommended: Python/FastAPI)

---

## 1) Target outputs and what should generate them

### 1.1 What the ML model should output
Your ML model (computer vision) should focus on **vision-derived facts**, for example:

- `is_healthy`: boolean
- `disease_key` or `disease`: string (include a “healthy” class or set `is_healthy=true`)
- `confidence`: float (0–1) or percent (0–100)
- `severity`: `low | moderate | high` (or a numeric `severity_score` 0–1)
- `model_version`: string

Optional but highly useful:

- `top_k`: top 3 classes with probabilities
- `image_quality`: blur/brightness/leaf-detected flags
- `explanations`: e.g., Grad-CAM heatmap URL (later)

### 1.2 What the backend should output (enriched)
The backend should take the ML output and attach **agronomy content** and **contextual insights**:

- `solution` (treatment steps)
- `prevention` (future prevention steps)
- `insights[]` (short bullets or cards)

Why backend enrichment is recommended:

- It’s more consistent than “free-form generation” inside the CNN.
- You can vet/curate treatment and prevention content.
- You can personalize insights using scan history and weather context.

---

## 2) Current repository state (important constraints)

Based on the current codebase:

- Backend scan endpoint is mounted at `/api/scans` (see backend server routing).
- Current scan controller uses a mock analyzer that accepts `cropType` and returns mock fields (`disease`, `confidence`, `severity`, `solution`).
- Frontend scan pages are placeholders (ScanPage and ScanResultPage), which is good: you can implement the upload and result UI without breaking existing flows.

Note: The README mentions `/api/scan/upload`, but the implemented route is `/api/scans`. For planning, decide whether to:

- Keep `/api/scans` as the canonical route (recommended: minimal change)
- Or add an alias `/api/scan/upload` for docs consistency

---

## 3) Severity: approaches (pick one)

Severity is typically the hardest output to do well. Choose the approach that matches your dataset and timeline.

### Option A: Multi-task classification (fastest)
Train one backbone with two heads:

- Disease classification head
- Severity classification head (`low/moderate/high`)

Pros:
- Simple to implement and deploy
- Single forward pass

Cons:
- Requires good severity labels
- Severity can be “coarse”

Best when:
- You already have severity labels per image.

### Option B: Segmentation-based severity (best quality)
Train a segmentation model to isolate lesions and compute severity via coverage:

- Severity score = (lesion area) / (leaf area)
- Map to bands (low/moderate/high)

Pros:
- Explainable severity (“~25% leaf affected”)
- Often more robust

Cons:
- Requires segmentation masks (more expensive labels)
- More complex pipeline

Best when:
- Severity accuracy matters a lot and you can label masks.

### Option C: Hybrid / heuristic severity (pragmatic)
Use classification + simple rules:

- disease-specific priors
- thresholds on confidence + symptoms
- optional small second model for severity only

Pros:
- Works when severity labels are weak

Cons:
- Less “pure ML”, harder to justify scientifically

---

## 4) Solution + prevention: build a disease knowledge base

Do **not** depend on the vision model to generate treatment text.

Instead, maintain a curated mapping from disease + severity to:

- Treatment steps (solution)
- Prevention steps
- Escalation guidance (“when to contact an agronomist”)

### Storage choices

1. **JSON file in backend** (fastest)
2. **Database table** (best long-term)
3. JSON seed → DB later (good compromise)

### Suggested structure (JSON example)
```json
{
  "tomato_early_blight": {
    "display_name": "Early Blight",
    "solutions": {
      "low": ["Remove affected leaves", "Improve airflow"],
      "moderate": ["Apply fungicide per label", "Remove infected foliage"],
      "high": ["Remove heavily infected plants", "Treat surrounding plants", "Consider expert help"]
    },
    "prevention": [
      "Rotate crops yearly",
      "Avoid overhead irrigation",
      "Space plants for airflow"
    ]
  }
}
```

---

## 5) Meaningful insights: how to generate them

Meaningful insights should be grounded in:

- Current scan result (disease + severity + confidence)
- Scan history (recurrence/outbreak detection)
- Weather/environment signals (optional but powerful)

Start with a **rule-based insight engine** because it’s testable and stable.

### Example insight rules

- Low confidence (< threshold): recommend re-scan and better lighting.
- High severity: prioritize isolation/removal and quick intervention.
- Same disease repeats 3+ times in 7 days: outbreak warning.
- High humidity + fungal disease: high risk warning.

### Suggested insight format
```json
[
  {"title": "Outbreak risk", "description": "3 similar cases in 7 days. Sanitize tools and isolate infected plants."},
  {"title": "Weather risk", "description": "High humidity increases fungal spread. Improve airflow and avoid late-day watering."}
]
```

Later, if you want more natural language, you can optionally use an LLM to *rewrite* insights from structured facts (guardrailed), but keep the source-of-truth structured.

---

## 6) Recommended architecture: separate ML inference service

### Why separate service
Running ML inference in Node is possible but usually painful (runtime, dependencies, performance).

Recommended:

- Backend: Node/Express (auth, storage, DB, logic)
- ML service: Python/FastAPI (model loading + inference)

### Service interface
The ML service should expose:

- `POST /predict` (multipart form upload)

Return:

```json
{
  "is_healthy": false,
  "disease_key": "tomato_early_blight",
  "display_name": "Early Blight",
  "confidence": 0.923,
  "severity": "moderate",
  "severity_score": 0.63,
  "model_version": "v1.0.0",
  "top_k": [
    {"disease_key": "tomato_early_blight", "p": 0.923},
    {"disease_key": "tomato_septoria_leaf_spot", "p": 0.041},
    {"disease_key": "healthy", "p": 0.018}
  ]
}
```

---

## 7) Backend API design (GreenCore)

### 7.1 Keep `/api/scans` as the main entry point (recommended)
Change `POST /api/scans` to accept an image upload.

Request: `multipart/form-data`

- `image`: file (required)
- `cropType`: string (optional)
- `gps_latitude`, `gps_longitude`: optional

Response (enriched + persisted):

```json
{
  "message": "Scan analyzed",
  "scan": {
    "id": "uuid",
    "user_id": "uuid",
    "crop_type": "tomato",
    "disease": "Early Blight",
    "confidence": 92.3,
    "severity": "Moderate",
    "solution": "...",
    "prevention": "...",
    "image_url": "https://...",
    "model_version": "v1.0.0",
    "insights": [
      {"title": "...", "description": "..."}
    ],
    "created_at": "2026-..."
  }
}
```

### 7.2 Optional: prediction-only endpoint for ML iteration
Add:

- `POST /api/predict`

Returns ML output + enrichment but does not write to DB.

---

## 8) Backend implementation steps (Node/Express)

### Step 1: accept file upload
Use `multer`:

- validate content type
- enforce size limits

### Step 2: upload image to storage
Recommended: Supabase Storage.

- path like `scans/<userId>/<timestamp>.jpg`
- store `image_url`

### Step 3: call ML inference service
Send image bytes to FastAPI:

- `POST /predict` with multipart file
- include crop type if you want class filtering

### Step 4: enrich with knowledge base
- lookup disease key
- pick solution based on severity
- attach prevention steps

### Step 5: generate insights
Use rule engine:

- scan history query for recurrence
- optional weather risk
- include “re-scan” insight if low confidence

### Step 6: persist scan
Use existing scan model insertion. Extend scan fields as needed.

---

## 9) Database + schema recommendations (Supabase)

Current scans schema in the README includes:

- `severity`
- `solution`
- `image_url`

To support full features, strongly consider adding:

- `prevention TEXT`
- `insights JSONB`
- `model_version TEXT`
- `raw_prediction JSONB` (optional but extremely useful)

If you want to avoid schema changes initially:

- Store prevention appended into `solution` text
- But plan to split later for UI/analytics clarity

---

## 10) Frontend implementation plan (React)

### 10.1 ScanPage (upload)
Implement:

- File input / capture
- Submit -> `FormData`
- POST to backend with bearer token

On success:

- Navigate to `/scan-result/:scanId`

### 10.2 ScanResultPage (results)
Render:

- image preview
- diagnosis + confidence
- severity badge
- solution steps
- prevention steps
- insights cards

### 10.3 Align dashboard + history field naming
Your dashboard recent scans UI should use the DB fields consistently:

- use `image_url` (not `crop_image`)
- use `disease` (not `disease_name`)
- use `confidence` (not `confidence_score`)
- use `created_at` (not `scan_date`)

Decide whether to:

- map backend response into the UI format, or
- update the UI to match the DB fields (recommended)

---

## 11) Model output contract (lock early)

Define a stable contract between ML service and backend.

### Suggested “raw ML” output
```json
{
  "disease_key": "tomato_early_blight",
  "display_name": "Early Blight",
  "is_healthy": false,
  "confidence": 0.923,
  "severity": "moderate",
  "severity_score": 0.63,
  "model_version": "v1.0.0"
}
```

Backend then:

- maps to stored fields
- attaches solution/prevention/insights

---

## 12) Quality and research considerations

### 12.1 Image quality gating
Before inference:

- detect blur/low light
- detect leaf presence / framing

If quality is poor:

- return low-confidence message
- request re-capture

This improves trust and reduces garbage predictions.

### 12.2 Confidence calibration
Research:

- Temperature scaling
- Calibration metrics (ECE)

A calibrated model produces confidence scores that match reality.

### 12.3 Handling uncertainty
If confidence is below threshold:

- show top-k predictions
- recommend re-scan
- avoid overconfident “solutions”

### 12.4 Versioning
Always store:

- `model_version`

Optionally store:

- `raw_prediction`

This is crucial for evaluating and debugging model improvements.

---

## 13) Deployment notes

### ML service
- Docker container on Fly.io / Render / Cloud Run
- Load the model once at startup

### Backend
- Express server on Render (or similar)
- Ensure CORS allows frontend origin

### Storage + DB
- Supabase Storage bucket for images
- Supabase Postgres for scan records

---

## 14) Practical milestone plan

### Milestone 1 (end-to-end MVP)
- Upload image -> ML predicts disease + severity + confidence
- Backend enriches using knowledge base
- Persist scan with image URL
- Show results in ScanResultPage

### Milestone 2 (insights)
- Add scan history recurrence insights
- Add basic weather risk insights if weather API is available

### Milestone 3 (severity upgrade)
- If needed, move from severity head to segmentation-based severity

---

## 15) Decisions to finalize now

1. Severity approach: multi-task classification or segmentation?
2. ML service input: send bytes vs send image URL?
3. DB storage: add `prevention` and `insights` columns now or later?
4. Confidence handling: what threshold triggers “uncertain” UX?

Once these are set, you can implement with minimal rework.

---

## 16) Contingency plan (if not all models are ready)

This section explains how to **ship the main feature reliably** even if you cannot complete all ML training (severity head, segmentation model, image-quality model, weather risk model, etc.) before your deadline.

### 16.1 Define the “main feature” in a shippable way

The shippable core value of GreenCore is:

1. User uploads a crop photo
2. System returns a **diagnosis outcome** with an honest confidence story
3. System provides **actionable next steps** (treatment + prevention)
4. The scan is saved and visible in **history** and **dashboard**

If you can deliver those consistently, you have delivered the main feature.

### 16.2 Prioritize one strong model, not many

If time is tight, aim to ship only:

- **Healthy vs diseased** (binary)
- **Disease classification** (multiclass) OR a smaller disease set for the crops you support

This gets you the highest product value per ML effort.

### 16.3 Provide severity even without a trained severity model

If severity cannot be trained in time, you can still return a consistent `severity` field using one of these options.

#### Option 1 (recommended for MVP): `severity = unknown` with strong UX

- Return `severity: "unknown"` (or `null`) when you don’t have a reliable estimate
- In the UI, show:
  - “Severity not available yet”
  - “Recommended next steps” (still provided)
  - a prompt to re-scan if confidence is low

This is the most honest approach and protects trust.

#### Option 2 (temporary heuristic severity): map from confidence bands

If stakeholders insist on a severity label, implement a conservative mapping:

- If `confidence < 0.60` → `severity = unknown` and recommend re-scan
- If `0.60 ≤ confidence < 0.85` → `severity = low` (conservative)
- If `0.85 ≤ confidence < 0.95` → `severity = moderate`
- If `confidence ≥ 0.95` → `severity = moderate` by default; optionally `high` only for diseases known to escalate quickly

Important: document this clearly in the backend (and optionally the UI) so it’s not misrepresented as a medical-grade metric.

### 16.4 Deliver “solution” and “prevention” without extra ML

You can still deliver excellent treatment and prevention guidance by using a curated knowledge base.

Minimum approach:

- Maintain a JSON mapping `disease_key -> solution_steps + prevention_steps`
- Backend chooses the appropriate severity bucket (or a default bucket) and returns:
  - `solution` (or `solution_steps[]`)
  - `prevention` (or `prevention_steps[]`)

This often makes the product feel more valuable than extra model complexity.

### 16.5 Make “meaningful insights” rule-based first

If you can’t build weather risk or advanced analytics yet, you can still provide meaningful insights from:

- Confidence thresholds (re-scan guidance)
- Recurrence in scan history (outbreak risk)
- Simple “next best action” guidance based on severity/unknown severity

Example insights you can ship with no additional models:

- “Low confidence: retake photo in better lighting.”
- “Repeated detections: consider isolating plants and sanitizing tools.”
- “High disease frequency this week: review spacing and irrigation timing.”

### 16.6 Add an uncertainty-first UX to protect user trust

Your UX should explicitly handle uncertainty.

Recommended rules:

- If confidence < a threshold (e.g., 0.60):
  - show “Uncertain result”
  - show top-2/top-3 candidates if available
  - recommend re-scan with clear photo tips
- If confidence is high:
  - show diagnosis normally

This is one of the most important product safeguards.

### 16.7 MVP acceptance checklist (for shipping)

You can consider the main feature delivered when all of the following are true:

- Upload photo from frontend works end-to-end (ScanPage)
- Backend returns `disease/healthy` and `confidence` reliably
- Backend returns **solution + prevention** (knowledge base)
- Results UI shows diagnosis, confidence, and next steps clearly (ScanResultPage)
- Scan record is persisted (Supabase) with `image_url` and prediction fields
- Dashboard and scan history can display recent scans without field mismatches

### 16.8 Phased rollout plan (safe and practical)

**Phase 1 (ship):**

- Disease/healthy classification
- KB-based solution + prevention
- Uncertainty UX and confidence thresholds
- Persist scans + show in dashboard/history

**Phase 2 (upgrade):**

- Severity model (multi-task head) OR improved heuristic severity
- Better insights from scan history trends

**Phase 3 (best quality):**

- Segmentation-based severity
- Image-quality model
- Weather-driven disease risk insights

### 16.9 What to communicate to judges/users (demo narrative)

If you’re presenting or demoing, emphasize:

- “We provide diagnosis with confidence, and we’re honest about uncertainty.”
- “Recommendations come from curated agronomy guidance aligned with the prediction.”
- “The system saves scans and learns patterns over time (history + dashboard).”

This frames the product as trustworthy and usable even before advanced ML is complete.

---

## 17) Open-source model strategy (to accelerate delivery)

This section documents a realistic plan to use **open-source AI models** to cover as much as possible quickly.

### 17.1 Reality check: what you can and cannot get “all-in-one”

It’s uncommon to find a single open-source computer vision model that reliably outputs all of:

- disease/healthy
- disease class
- severity
- solution
- prevention
- meaningful insights

In practice, the best architecture is:

1. **Open-source vision model(s)** provide structured predictions (disease/healthy + probability and optionally masks).
2. **GreenCore backend** enriches with curated agronomy content (solution/prevention) and generates insights (rules + history).

This separation is more reliable and easier to validate.

### 17.2 Your supported crops (current scope)

For this project, you listed these target crops:

- tomato
- maize
- rice
- cassava
- yam
- wheat
- sorghum
- soybean
- groundnut

Because you have many crops, prioritize the demo by selecting a small set of high-impact diseases per crop (top 1–3 each) and ship those first.

### 17.3 Disease detection: open-source classifier (recommended base)

Use an open-source image classifier (fine-tuned) for:

- `is_healthy`
- `disease_key` / `disease`
- `confidence`

Implementation note:

- Many public “PlantVillage-style” models work well on clean lab images but can degrade on real farm photos (domain shift).
- If your demo images are “in the wild”, plan to fine-tune with a small set of your own field photos for robustness.

### 17.4 Severity as % leaf affected (your chosen approach)

You selected **segmentation-based severity** using a severity proxy:

$$severity\_score = \frac{lesion\_area}{leaf\_area}$$

Where:

- `leaf_area` is the area of the leaf mask
- `lesion_area` is the area of the diseased-region mask

#### Practical open-source approach

To get the two masks, you can use:

1. **Leaf segmentation (fast path):** use a general segmentation model to isolate the leaf.
   - A strong open-source candidate is the Segment Anything family (SAM/SAM2) for obtaining a leaf mask with minimal task-specific training.
2. **Lesion segmentation (best quality):** train or adopt a U-Net / DeepLab style segmentation model to isolate lesions.
   - If lesion weights are not available for your exact diseases, you can still ship Phase 1 with leaf-only masking and defer lesion segmentation.

If lesion segmentation is not ready:

- Return `severity_score: null` and/or `severity: "unknown"`.
- This is better than guessing: it protects trust and keeps your outputs consistent.

### 17.5 Solution + prevention: don’t rely on CV models

Even if you find a classifier and segmentation model, you should still attach:

- `solution` (treatment steps)
- `prevention` (future prevention)

from a curated knowledge base in the backend. This is the fastest and most controllable way to deliver your required feature set.

### 17.6 Meaningful insights: rule-based first, optional LLM later

With open-source vision models, “insights” should come from:

- confidence thresholds (re-scan guidance)
- severity score thresholds (prioritization)
- recurrence trends in scan history (outbreak signals)
- optional weather/humidity risk (later)

If you later add an LLM, use it only to rewrite/format insights from structured facts.

---

## 18) ML service contract for GreenCore (recommended)

To keep integration stable, define a strict contract between your ML inference service and your Node/Express backend.

### 18.1 ML service should return structured facts (not advice text)

Recommended ML response:

```json
{
  "is_healthy": false,
  "disease_key": "tomato_early_blight",
  "display_name": "Early Blight",
  "confidence": 0.92,
  "leaf_area_px": 120340,
  "lesion_area_px": 20340,
  "severity_score": 0.169,
  "model_version": "v1.0.0",
  "top_k": [
    {"disease_key": "tomato_early_blight", "p": 0.92},
    {"disease_key": "tomato_late_blight", "p": 0.05}
  ],
  "image_quality": {
    "leaf_found": true,
    "blurry": false,
    "too_dark": false
  }
}
```

Notes:

- If you do not have lesion segmentation yet, return `lesion_area_px: null` and `severity_score: null`.
- If you do not compute image quality yet, omit `image_quality`.

### 18.2 Backend should enrich and persist

Backend responsibilities:

- Convert `severity_score` into a label (`low/moderate/high`) if you want labels in UI.
- Attach `solution` and `prevention` from the knowledge base.
- Generate `insights[]` (rule-based).
- Persist scan to Supabase with `image_url`, prediction fields, and `model_version`.

### 18.3 Suggested confidence thresholds (starting point)

These should be tuned later, but as an initial research baseline:

- `confidence < 0.60`: show “Uncertain”, recommend re-scan, avoid strong recommendations
- `0.60 ≤ confidence < 0.85`: show diagnosis with caution messaging
- `confidence ≥ 0.85`: normal display

### 18.4 Suggested severity band thresholds (starting point)

If you compute severity via lesion/leaf area, start with generic thresholds:

- `severity_score < 0.10` → `low`
- `0.10 ≤ severity_score < 0.25` → `moderate`
- `severity_score ≥ 0.25` → `high`

These should be disease- and crop-specific later.

---

## 19) Rollout plan using open-source models

This is a practical path to deliver quickly with minimal risk.

### Phase 1 (ship fast)

- Open-source classifier for `healthy/disease` + `disease_key` + `confidence`
- Backend knowledge base for `solution` + `prevention`
- Uncertainty UX
- Persist scan records + show in dashboard/history

### Phase 2 (add severity proxy)

- Leaf masking (SAM/SAM2) for `leaf_area`
- Lesion segmentation model for `lesion_area`
- Compute `severity_score` and map to severity label

### Phase 3 (improve trust and robustness)

- Image quality checks (blur/dark/leaf found)
- Domain fine-tuning on your own field photos
- Calibration of confidence

