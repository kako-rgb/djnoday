from flask import Blueprint, jsonify, request
from src.models.mongodb import mongodb

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        # Preflight request handled by flask-cors globally
        return '', 204

    try:
        # Test database connection
        mongodb.client.admin.command('ping')

        db_info = {
            'status': 'healthy',
            'database': 'connected',
            'database_name': mongodb.db.name if mongodb.db else None,
            'collections': []
        }

        if mongodb.db is not None:
            db_info['collections'] = mongodb.db.list_collection_names()

        return jsonify(db_info), 200

    except Exception as e:
        error_response = {
            'status': 'error',
            'database': 'connection failed',
            'error': str(e)
        }
        return jsonify(error_response), 500
