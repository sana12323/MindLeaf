from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from functools import wraps
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
try:
    client = MongoClient(MONGODB_URI)
    db = client["mindleaf"]
    # Collections
    journal = db["journal"]
    todo = db["todo"]
    affirmations = db["affirmations"]
    gratitude = db["gratitude"]
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

def error_handler(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500
    return wrapper

def validate_user_id(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = request.args.get('user_id') if request.method == 'GET' else request.json.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        return f(*args, **kwargs)
    return wrapper

# --- Daily Journal Endpoints ---

@app.route('/api/journal', methods=['POST'])
@error_handler
@validate_user_id
def save_journal():
    data = request.json
    user_id = data["user_id"]
    date = data["date"]
    entry = {
        "user_id": user_id,
        "date": date,
        "text": data["text"],
        "stickers": data.get("stickers", []),
        "images": data.get("images", []),
        "updated_at": datetime.utcnow()
    }
    try:
        journal.update_one({"user_id": user_id, "date": date}, {"$set": entry}, upsert=True)
        logger.info(f"Saved journal entry for user {user_id} on {date}")
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error saving journal entry: {str(e)}")
        return jsonify({"error": "Failed to save entry"}), 500

@app.route('/api/journal', methods=['GET'])
@error_handler
@validate_user_id
def get_journal():
    user_id = request.args.get("user_id")
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "Date is required"}), 400
    try:
        entry = journal.find_one({"user_id": user_id, "date": date}, {"_id": 0})
        return jsonify(entry or {})
    except Exception as e:
        logger.error(f"Error retrieving journal entry: {str(e)}")
        return jsonify({"error": "Failed to retrieve entry"}), 500

@app.route('/api/journal/history', methods=['GET'])
@error_handler
@validate_user_id
def get_journal_history():
    user_id = request.args.get("user_id")
    try:
        entries = journal.find(
            {"user_id": user_id},
            {"_id": 0, "date": 1}
        ).sort("date", -1)  # Sort by date descending
        return jsonify([e["date"] for e in entries])
    except Exception as e:
        logger.error(f"Error retrieving journal history: {str(e)}")
        return jsonify({"error": "Failed to retrieve history"}), 500

# --- To-Do List Endpoints ---

@app.route('/api/todo', methods=['POST'])
@error_handler
@validate_user_id
def save_todo():
    data = request.json
    user_id = data["user_id"]
    date = data["date"]
    tasks = data.get("tasks", [])
    if not tasks:
        # If no tasks, remove the todo entry for this date
        try:
            todo.delete_one({"user_id": user_id, "date": date})
            logger.info(f"Deleted todo entry for user {user_id} on {date}")
            return jsonify({"status": "deleted"})
        except Exception as e:
            logger.error(f"Error deleting todo entry: {str(e)}")
            return jsonify({"error": "Failed to delete entry"}), 500
    try:
        todo.update_one({"user_id": user_id, "date": date}, {"$set": {"tasks": tasks}}, upsert=True)
        logger.info(f"Saved todo entry for user {user_id} on {date}")
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error saving todo entry: {str(e)}")
        return jsonify({"error": "Failed to save entry"}), 500

@app.route('/api/todo', methods=['GET'])
@error_handler
@validate_user_id
def get_todo():
    user_id = request.args.get("user_id")
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "Date is required"}), 400
    try:
        entry = todo.find_one({"user_id": user_id, "date": date}, {"_id": 0})
        return jsonify(entry or {})
    except Exception as e:
        logger.error(f"Error retrieving todo entry: {str(e)}")
        return jsonify({"error": "Failed to retrieve entry"}), 500

@app.route('/api/todo/dates', methods=['GET'])
@error_handler
@validate_user_id
def get_todo_dates():
    user_id = request.args.get("user_id")
    try:
        entries = todo.find(
            {"user_id": user_id},
            {"_id": 0, "date": 1}
        ).sort("date", -1)  # Sort by date descending
        return jsonify([e["date"] for e in entries])
    except Exception as e:
        logger.error(f"Error retrieving todo dates: {str(e)}")
        return jsonify({"error": "Failed to retrieve dates"}), 500

# --- Affirmations Endpoints ---

@app.route('/api/affirmation', methods=['POST'])
@error_handler
@validate_user_id
def save_affirmation():
    data = request.json
    user_id = data["user_id"]
    date = data["date"]
    text = data.get("text", "")
    if not text.strip():
        # If empty, remove the entry
        try:
            affirmations.delete_one({"user_id": user_id, "date": date})
            logger.info(f"Deleted affirmation entry for user {user_id} on {date}")
            return jsonify({"status": "deleted"})
        except Exception as e:
            logger.error(f"Error deleting affirmation entry: {str(e)}")
            return jsonify({"error": "Failed to delete entry"}), 500
    try:
        affirmations.update_one({"user_id": user_id, "date": date}, {"$set": {"text": text}}, upsert=True)
        logger.info(f"Saved affirmation entry for user {user_id} on {date}")
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error saving affirmation entry: {str(e)}")
        return jsonify({"error": "Failed to save entry"}), 500

@app.route('/api/affirmation', methods=['GET'])
@error_handler
@validate_user_id
def get_affirmation():
    user_id = request.args.get("user_id")
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "Date is required"}), 400
    try:
        entry = affirmations.find_one({"user_id": user_id, "date": date}, {"_id": 0})
        return jsonify(entry or {})
    except Exception as e:
        logger.error(f"Error retrieving affirmation entry: {str(e)}")
        return jsonify({"error": "Failed to retrieve entry"}), 500

@app.route('/api/affirmation/dates', methods=['GET'])
@error_handler
@validate_user_id
def get_affirmation_dates():
    user_id = request.args.get("user_id")
    try:
        entries = affirmations.find(
            {"user_id": user_id},
            {"_id": 0, "date": 1}
        ).sort("date", -1)  # Sort by date descending
        return jsonify([e["date"] for e in entries])
    except Exception as e:
        logger.error(f"Error retrieving affirmation dates: {str(e)}")
        return jsonify({"error": "Failed to retrieve dates"}), 500

# --- Gratitude Journal Endpoints ---

@app.route('/api/gratitude', methods=['POST'])
@error_handler
@validate_user_id
def save_gratitude():
    data = request.json
    user_id = data["user_id"]
    date = data["date"]
    
    if not data.get("text", "").strip():
        return jsonify({"error": "Entry text is required"}), 400
        
    entry = {
        "user_id": user_id,
        "date": date,
        "text": data["text"],
        "stickers": data.get("stickers", []),
        "images": data.get("images", []),
        "updated_at": datetime.utcnow()
    }
    
    try:
        gratitude.update_one(
            {"user_id": user_id, "date": date},
            {"$set": entry},
            upsert=True
        )
        logger.info(f"Saved gratitude entry for user {user_id} on {date}")
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error saving gratitude entry: {str(e)}")
        return jsonify({"error": "Failed to save entry"}), 500

@app.route('/api/gratitude', methods=['GET'])
@error_handler
@validate_user_id
def get_gratitude():
    user_id = request.args.get("user_id")
    date = request.args.get("date")
    
    if not date:
        return jsonify({"error": "Date is required"}), 400
        
    try:
        entry = gratitude.find_one({"user_id": user_id, "date": date}, {"_id": 0})
        return jsonify(entry or {})
    except Exception as e:
        logger.error(f"Error retrieving gratitude entry: {str(e)}")
        return jsonify({"error": "Failed to retrieve entry"}), 500

@app.route('/api/gratitude/history', methods=['GET'])
@error_handler
@validate_user_id
def get_gratitude_history():
    user_id = request.args.get("user_id")
    try:
        entries = gratitude.find(
            {"user_id": user_id},
            {"_id": 0, "date": 1}
        ).sort("date", -1)  # Sort by date descending
        return jsonify([e["date"] for e in entries])
    except Exception as e:
        logger.error(f"Error retrieving gratitude history: {str(e)}")
        return jsonify({"error": "Failed to retrieve history"}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow()})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)