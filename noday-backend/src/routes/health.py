from flask import Blueprint, jsonify, request, current_app, make_response
from src.models.mongodb import mongodb

health_bp = Blueprint('health', __name__)

# --- Helper function to add CORS headers ---
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'https://nodayzentertainment.co.ke'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Max-Age'] = '600'
    response.headers['Access-Control-Expose-Headers'] = 'Content-Type, X-Total-Count'
    return response

# --- Health check route ---
@health_bp.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response('', 204)
        return add_cors_headers(response)

    # Handle GET request
    try:
        # Test MongoDB connection
        mongodb.client.admin.command('ping')

        db_info = {
            'status': 'healthy',
            'database': 'connected',
            'database_name': mongodb.db.name if mongodb.db else None,
            'collections': []
        }

        if mongodb.db is not None:
            db_info['collections'] = mongodb.db.list_collection_names()

        response = jsonify(db_info)
        response.status_code = 200
    except Exception as e:
        error_response = {
            'status': 'error',
            'database': 'connection failed',
            'error': str(e)
        }
        response = jsonify(error_response)
        response.status_code = 500

    return add_cors_headers(response)

# --- Optional: Register after_request handler for all routes in this Blueprint ---
@health_bp.after_request
def apply_cors(response):
    return add_cors_headers(response)
