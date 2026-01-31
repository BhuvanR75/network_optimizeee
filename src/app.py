# app.py
import os
import shutil
import zipfile
import uuid
from flask import Flask, jsonify, request
from inference import infer_topology

UPLOAD_DIR = "uploads"
EXTRACT_DIR = "extracted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXTRACT_DIR, exist_ok=True)

app = Flask(__name__)

# -------------------------------------------------
# Health check
# -------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# -------------------------------------------------
# Infer topology from existing data directory
# -------------------------------------------------
@app.route("/infer-topology", methods=["POST"])
def infer_from_dir():
    payload = request.get_json(silent=True) or {}
    data_dir = payload.get("data_dir", "data")

    try:
        result = infer_topology(data_dir)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def find_data_dir(root_dir):
    """
    Recursively find the directory that contains throughput-cell-*.dat files
    """
    for root, dirs, files in os.walk(root_dir):
        for f in files:
            if f.startswith("throughput-cell") and f.endswith(".dat"):
                return root
    return None


# -------------------------------------------------
# Infer topology from ZIP upload
# -------------------------------------------------
@app.route("/infer-topology-upload", methods=["POST"])
def infer_from_upload():
    if "file" not in request.files:
        return jsonify({"error": "No file field provided"}), 400

    file = request.files["file"]

    if not file.filename.endswith(".zip"):
        return jsonify({"error": "Only ZIP files are supported"}), 400

    request_id = str(uuid.uuid4())
    zip_path = os.path.join(UPLOAD_DIR, f"{request_id}.zip")
    extract_path = os.path.join(EXTRACT_DIR, request_id)

    try:
        file.save(zip_path)

        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_path)

        data_dir = find_data_dir(extract_path)
        if data_dir is None:
            return jsonify({
                "error": "No throughput-cell-*.dat files found in ZIP"
            }), 400

        result = infer_topology(data_dir)

        return jsonify({
            "request_id": request_id,
            "data_dir_used": data_dir,
            "result": result
        }), 200

    finally:
        if os.path.exists(zip_path):
            os.remove(zip_path)
        if os.path.exists(extract_path):
            shutil.rmtree(extract_path)

# -------------------------------------------------
if __name__ == "__main__":
    app.run()
