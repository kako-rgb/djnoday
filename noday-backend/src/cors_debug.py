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
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ]

    CORS(app, 
         origins=allowed_origins,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
         expose_headers=["Content-Type", "X-Total-Count"],
         supports_credentials=True,
         max_age=600
    )
    
    @app.after_request
    def after_request(response):
        from flask import request
        origin = "*"
        if hasattr(request, 'headers') and 'Origin' in request.headers:
            if request.headers['Origin'] in allowed_origins:
                origin = request.headers['Origin']
        
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response