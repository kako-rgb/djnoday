from flask import Blueprint, jsonify, request
from src.models.mongodb import mongodb

health_bp = Blueprint('health', __name__)

# --- Health check route ---
@health_bp.route('/health', methods=['GET'])
def health_check():
    print(f"📥 Health check request received - Method: {request.method}, Origin: {request.headers.get('Origin', 'N/A')}")

    # Handle GET request
    try:
        # Check if MongoDB client exists
        if mongodb.client is None:
            print("❌ MongoDB client is None, attempting to reconnect...")
            if not mongodb.connect():
                raise Exception("Failed to connect to MongoDB")

        # Test MongoDB connection
        print("🔍 Testing MongoDB connection...")
        mongodb.client.admin.command('ping')
        print("✅ MongoDB ping successful")

        db_info = {
            'status': 'healthy',
            'database': 'connected',
            'database_name': mongodb.db.name if mongodb.db is not None else None,
            'collections': []
        }

        if mongodb.db is not None:
            db_info['collections'] = mongodb.db.list_collection_names()
            print(f"📊 Found {len(db_info['collections'])} collections")

        print("✅ Health check successful")
        return jsonify(db_info), 200
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        error_response = {
            'status': 'error',
            'database': 'connection failed',
            'error': str(e),
            'client_status': 'None' if mongodb.client is None else 'Connected',
            'db_status': 'None' if mongodb.db is None else 'Connected'
        }
        return jsonify(error_response), 500
