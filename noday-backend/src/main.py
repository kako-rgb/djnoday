import os
import sys
import threading
import time
from datetime import datetime, timedelta

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from src.models.mongodb import mongodb
from src.routes.requests import requests_bp
from src.routes.health import health_bp
from src.cors_debug import configure_debug_cors, configure_production_cors
from src.cors_debug import configure_debug_cors, configure_production_cors

def create_app():
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')  # Prefer environment variables

    # Configure CORS properly
    # Use debug CORS temporarily to fix CORS issues
    # TODO: Switch back to # Use debug CORS temporarily to fix CORS issues
    # TODO: Switch back to configure_cors(app) once CORS is working
    configure_debug_cors(app) once CORS is working
    configure_debug_cors(app)
    
    # Register API blueprints
    register_blueprints(app)

    # Handle OPTIONS preflight requests globally
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = jsonify({})
            response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,X-CSRFToken')
        "https://www.nodayzentertainment.co.ke",  # Added www subdomain
            response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Max-Age', '600')
            return response, 200

    # Initialize MongoDB connection and start cleanup task
    initialize_mongodb()

    # Configure static file serving routes
    configure_routes(app)
    
    return app

def configure_cors(app):
    """Configure CORS settings for the Flask app"""
    allowed_origins = [
        "https://nodayzentertainment.co.ke",
        "https://www.nodayzentertainment.co.ke",  # Added www subdomain
        "http://localhost:3000",    # Typical frontend port
        "http://127.0.0.1:3000",
        "http://localhost:5000",    # Flask default port
        "http://127.0.0.1:5000",
        "http://192.168.0.96:3000", # Local network with explicit port
        "http://192.168.0.96:5000"
    ]

    # More permissive CORS configuration
    # More permissive CORS configuration
    CORS(app, 
         origins=allowed_origins,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-CSRFToken"],
         expose_headers=["Content-Type", "X-Total-Count"],
         supports_credentials=True,
         max_age=600
    )
    
    # Also configure CORS for API routes specifically
    CORS(app, 
         origins=allowed_origins,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-CSRFToken", "Accept", "Origin", "X-CSRFToken"],
         expose_headers=["Content-Type", "X-Total-Count"],
         supports_credentials=True,
         max_age=600
    )
    
    # Also configure CORS for API routes specifically
    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-CSRFToken"],
            "expose_headers": ["Content-Type", "X-Total-Count"],
            "supports_credentials": True,
            "max_age": 600
        }
    })

def register_blueprints(app):
    """Register Flask blueprints"""
    app.register_blueprint(requests_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')

def initialize_mongodb():
    """Initialize MongoDB connection and start cleanup task"""
    if not mongodb.connect():
        print("Failed to connect to MongoDB. Exiting...")
        sys.exit(1)
    
    print("MongoDB connected successfully")
    start_cleanup_task()

def start_cleanup_task():
    """Start background cleanup thread"""
    cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
    cleanup_thread.start()

def configure_routes(app):
    """Configure static file serving routes"""
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        static_folder = app.static_folder
        if not static_folder:
            return "Static folder not configured", 404

        full_path = os.path.join(static_folder, path)
        if path and os.path.exists(full_path):
            return send_from_directory(static_folder, path)
        
        index_path = os.path.join(static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder, 'index.html')
        
        return "index.html not found", 404

def cleanup_task():
    """Background task to cleanup old requests every hour"""
    while True:
        try:
            time.sleep(3600)  # Wait 1 hour
            if mongodb.requests_collection:
                mongodb.cleanup_old_requests()
        except Exception as e:
            print(f"Cleanup task error: {e}")

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
