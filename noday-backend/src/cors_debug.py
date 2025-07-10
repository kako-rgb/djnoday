"""
Debug CORS configuration - Use this temporarily to debug CORS issues
WARNING: This is more permissive and should only be used for debugging
"""

from flask_cors import CORS

def configure_debug_cors(app):
    """
    More permissive CORS configuration for debugging
    WARNING: Use only for debugging, not in production
    """
    
    # Very permissive CORS for debugging
    CORS(app, 
         origins="*",  # Allow all origins for debugging
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["*"],  # Allow all headers
         expose_headers=["*"],
         supports_credentials=False,  # Disable credentials for debugging
         max_age=0  # Don't cache preflight requests
    )
    
    # Add manual headers for extra assurance
    @app.after_request
    def after_request(response):
        origin = "*"  # For debugging only
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'false')
        return response

def configure_production_cors(app):
    """
    Production-ready CORS configuration
    """
    allowed_origins = [
        "https://nodayzentertainment.co.ke",
        "https://www.nodayzentertainment.co.ke",
        "https://djnoday2.onrender.com",  # Backend URL for self-requests (updated)
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:8000",  # Common development server port
        "http://127.0.0.1:8000"
    ]

    # Configure CORS with proper settings for production
    CORS(app, 
         origins=allowed_origins,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cache-Control", "Pragma"],
         expose_headers=["Content-Type", "X-Total-Count"],
         supports_credentials=False,  # Changed to False to match frontend
         max_age=600,
         send_wildcard=False,
         automatic_options=True
    )