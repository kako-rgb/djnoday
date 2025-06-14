import os
import sys
import threading
import time
from datetime import datetime, timedelta

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.mongodb import mongodb
from src.routes.requests import requests_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app, origins="*")

# Register API blueprints
app.register_blueprint(requests_bp, url_prefix='/api')

# Background cleanup task
def cleanup_task():
    """Background task to cleanup old requests every hour"""
    while True:
        try:
            time.sleep(3600)  # Wait 1 hour
            if mongodb.requests_collection:
                mongodb.cleanup_old_requests()
        except Exception as e:
            print(f"Cleanup task error: {e}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.before_first_request
def initialize_database():
    """Initialize MongoDB connection"""
    if mongodb.connect():
        print("MongoDB connected successfully")
        # Start background cleanup task
        cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
        cleanup_thread.start()
    else:
        print("Warning: MongoDB connection failed, using local storage fallback")

if __name__ == '__main__':
    # Initialize MongoDB connection
    if mongodb.connect():
        print("MongoDB connected successfully")
        # Start background cleanup task
        cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
        cleanup_thread.start()
    else:
        print("Warning: MongoDB connection failed, using local storage fallback")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

