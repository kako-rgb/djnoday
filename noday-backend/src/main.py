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
from src.deployment_health import deployment_health_bp
from src.cors_debug import configure_debug_cors, configure_production_cors
from src.routes.user import user_bp

def create_app():
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')  # Prefer environment variables

    # --- Robust CORS config for production ---
    allowed_origins = [
        "https://nodayzentertainment.co.ke",
        "https://www.nodayzentertainment.co.ke",
        "https://djnoday2.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    app.config['CORS_ALLOW_HEADERS'] = [
        "Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cache-Control", "Pragma"
    ]
    app.config['CORS_EXPOSE_HEADERS'] = ["Content-Type", "X-Total-Count"]
    app.config['CORS_ORIGINS'] = allowed_origins
    app.config['CORS_SUPPORTS_CREDENTIALS'] = False
    app.config['CORS_SEND_WILDCARD'] = False
    app.config['CORS_ALWAYS_SEND'] = True

    # Configure CORS properly (production setup)
    configure_production_cors(app)

    # --- Global after_request to ensure CORS headers on all responses ---
    @app.after_request
    def ensure_cors_headers(response):
        origin = request.headers.get('Origin')
        if origin and origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Vary'] = 'Origin'
            response.headers['Access-Control-Allow-Headers'] = ', '.join(app.config['CORS_ALLOW_HEADERS'])
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Expose-Headers'] = ', '.join(app.config['CORS_EXPOSE_HEADERS'])
            response.headers['Access-Control-Allow-Credentials'] = 'false'
        return response
    
    # Register API blueprints
    register_blueprints(app)

    # Note: OPTIONS preflight requests are now handled by the CORS configuration

    # Initialize MongoDB connection and start cleanup task
    initialize_mongodb()

    # Configure static file serving routes
    configure_routes(app)
    
    return app



def register_blueprints(app):
    """Register Flask blueprints"""
    # Register API blueprints
    app.register_blueprint(requests_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    
    # Register deployment health blueprint (without prefix for direct access)
    app.register_blueprint(deployment_health_bp)
    
    # Debug: Print all registered routes
    print("📋 Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"   {rule.methods} {rule.rule}")
    print("-" * 60)

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
        # Do not serve static for API routes
        if path.startswith('api/'):
            return "Not Found", 404

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
            if mongodb.requests_collection is not None:
                mongodb.cleanup_old_requests()
        except Exception as e:
            print(f"Cleanup task error: {e}")

if __name__ == '__main__':
    try:
        print("🚀 Starting Noday'z Entertainment Backend Server...")
        app = create_app()
        print("✅ Flask app created successfully")
        print("🌐 Server will be available at:")
        print("   - http://localhost:5000")
        print("   - http://127.0.0.1:5000")
        print("📡 API endpoints:")
        print("   - GET /api/health (health check)")
        print("   - GET /api/requests (get requests)")
        print("   - POST /api/requests (add request)")
        print("   - DELETE /api/requests/<id> (delete request)")
        print("🔧 CORS configured for development and production")
        print("Press Ctrl+C to stop the server")
        print("-" * 60)

        app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()
