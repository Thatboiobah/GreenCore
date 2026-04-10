from flask import Flask, render_template, request
import requests
import base64
import json
import re

app = Flask(__name__)


PLANTNET_API_KEY = "2b10A4wZUDlAoZ3GnXO6eIu"
PLANTNET_URL     = f"https://my-api.plantnet.org/v2/identify/all?api-key={PLANTNET_API_KEY}&lang=en"


GEMINI_API_KEY   = "AIzaSyDxtEb49z5qNhdf6dv7m2C9_TikJh6D6WI"
GEMINI_URL       = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"


ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE_MB   = 5


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def detect_disease_gemini(img_bytes, img_filename, plant_name="this plant"):
    """
    Send the plant image to Gemini Vision and ask it to detect diseases.
    Returns a dict with label, is_healthy, description, cure, prevention.
    """
    # Detect mime type from filename
    ext = img_filename.rsplit(".", 1)[-1].lower()
    mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
    mime_type = mime_map.get(ext, "image/jpeg")

    img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    prompt = f"""You are a professional plant pathologist with 20+ years of experience in tropical and subtropical agriculture (especially relevant for West Africa/Nigeria).

Analyze the provided image of {plant_name}.

Carefully examine:
- Leaf color, spots, lesions, wilting, powdery mildew, rust, blight patterns
- Stem, fruit, or root issues if visible
- Background context (soil, lighting)

Respond **exclusively** with a valid JSON object. No explanations, no markdown, no extra text.

Exact format:
{{
  "is_healthy": true or false,
  "disease_name": "Healthy" if healthy, otherwise the precise common and scientific name (e.g., "Tomato Early Blight (Alternaria solani)"),
  "confidence": "High" or "Medium" or "Low",
  "description": "2-3 clear sentences describing the observed symptoms and likely cause",
  "cure": "Step-by-step treatment recommendations (include organic options first, then chemical if needed). If healthy: 'No treatment needed'",
  "prevention": "3 specific, practical prevention tips tailored to home/small-scale farming"
}}"""

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": img_b64
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 800
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
        ]
    }

    headers = {"Content-Type": "application/json"}
    resp = requests.post(GEMINI_URL, headers=headers, json=payload, timeout=40)
    resp.raise_for_status()

    data = resp.json()
    raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

    # Aggressive cleaning for JSON
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```", 2)[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:].strip()
        else:
            raw_text = raw_text.strip()

    # Extract JSON object if there's extra text
    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if json_match:
        raw_text = json_match.group(0)

    try:
        result = json.loads(raw_text)
        return result
    except json.JSONDecodeError as e:
        app.logger.error(f"JSON parse failed: {e} | Raw: {raw_text[:500]}")
        # Safe fallback response
        return {
            "is_healthy": True,
            "disease_name": "Unable to determine",
            "confidence": "Low",
            "description": "Could not reliably analyze the image. Please try a clearer, well-lit photo of the affected leaves.",
            "cure": "No information available",
            "prevention": "Take clear photos in good lighting and try again."
        }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files.get("image")

    if not file or file.filename == "":
        return render_template("index.html", error="No image uploaded. Please select a file.")

    if not allowed_file(file.filename):
        return render_template("index.html", error="Invalid file type. Please upload a JPG, PNG, or WEBP image.")

    img_bytes = file.read()

    if len(img_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        return render_template("index.html", error=f"Image too large. Max size is {MAX_FILE_SIZE_MB}MB.")

    plant_info   = {}
    disease_info = {}

    try:
        # ── Step 1: PlantNet — Identify species ───────────────
        files_pn = [("images", (file.filename, img_bytes, "image/jpeg"))]
        data_pn  = {"organs": ["auto"]}
        pn_resp  = requests.post(PLANTNET_URL, files=files_pn, data=data_pn, timeout=30)

        plant_name = "this plant"  # fallback for Gemini prompt

        if pn_resp.status_code == 200:
            pn_data = pn_resp.json()
            results = pn_data.get("results", [])
            if results:
                top        = results[0]
                species    = top.get("species", {})
                score      = top.get("score", 0)
                plant_name = pn_data.get("bestMatch", "this plant")
                plant_info = {
                    "best_match":         plant_name,
                    "scientific_name":    species.get("scientificName", "Unknown"),
                    "common_names":       species.get("commonNames", ["Unknown"]),
                    "family":             species.get("family", {}).get("scientificNameWithoutAuthor", "Unknown"),
                    "genus":              species.get("genus", {}).get("scientificNameWithoutAuthor", "Unknown"),
                    "confidence":         f"{score * 100:.1f}%",
                    "low_confidence":     score < 0.5,
                    "remaining_requests": pn_data.get("remainingIdentificationRequests", "?"),
                }
            else:
                plant_info = {
                    "best_match": "Unknown", "scientific_name": "Unknown",
                    "common_names": ["Unknown"], "family": "Unknown",
                    "genus": "Unknown", "confidence": "0.0%",
                    "low_confidence": True, "remaining_requests": "?",
                }
        elif pn_resp.status_code == 429:
            return render_template("index.html", error="PlantNet rate limit reached. Try again tomorrow.")
        else:
            app.logger.warning(f"PlantNet returned {pn_resp.status_code}: {pn_resp.text[:200]}")
            plant_info = {
                "best_match": "Could not identify", "scientific_name": "Unknown",
                "common_names": ["Unknown"], "family": "Unknown",
                "genus": "Unknown", "confidence": "0.0%",
                "low_confidence": True, "remaining_requests": "?",
            }

        # ── Step 2: Gemini Vision — Detect disease ────────────
        try:
            gemini_result = detect_disease_gemini(img_bytes, file.filename, plant_name)

            disease_info = {
                "is_healthy":  gemini_result.get("is_healthy", True),
                "label":       gemini_result.get("disease_name", "Unknown"),
                "confidence":  gemini_result.get("confidence", "Medium"),
                "description": gemini_result.get("description", "No description available."),
                "cure":        gemini_result.get("cure", "No cure information available."),
                "prevention":  gemini_result.get("prevention", "No prevention information available."),
            }

        except requests.exceptions.ConnectionError:
            disease_info = {"error": "Cannot reach disease detection service. Check your internet connection."}
        except requests.exceptions.Timeout:
            disease_info = {"error": "Disease detection timed out. Please try again."}
        except requests.exceptions.HTTPError as e:
            status_code = e.response.status_code
            error_text = e.response.text[:500] if hasattr(e.response, 'text') and e.response.text else "No error body"
            app.logger.error(f"Gemini HTTP {status_code} error: {error_text}")
            
            if status_code == 429:
                disease_info = {"error": "Gemini rate limit reached. Please wait 1-2 minutes and try again (free tier has daily limits)."}
            elif status_code == 404:
                disease_info = {"error": "Gemini model not found. The old model has been updated."}
            elif status_code == 400:
                disease_info = {"error": "Invalid request to Gemini. Try a smaller or clearer image and try again."}
            else:
                disease_info = {"error": f"Disease detection failed (Error {status_code}). Please try again later."}
        except (KeyError, json.JSONDecodeError) as e:
            app.logger.error(f"Gemini parse error: {e}")
            disease_info = {"error": "Disease detection returned an unexpected response. Please try again."}

        result = {**plant_info, "disease": disease_info}

    except requests.exceptions.Timeout:
        return render_template("index.html", error="Request timed out. Please try again.")
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return render_template("index.html", error="An unexpected error occurred. Please try again.")

    return render_template("index.html", result=result)


if __name__ == "__main__":
    app.run(debug=True)