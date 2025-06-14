from flask import Blueprint, request, jsonify
from src.models.mongodb import mongodb

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/requests', methods=['GET'])
def get_requests():
    """Get all live requests from the last 12 hours"""
    try:
        requests = mongodb.get_requests()
        return jsonify({
            "success": True,
            "requests": requests,
            "count": len(requests)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@requests_bp.route('/requests', methods=['POST'])
def add_request():
    """Add a new live request"""
    try:
        data = request.get_json()
        
        if not data or 'music' not in data:
            return jsonify({
                "success": False,
                "error": "Music request is required"
            }), 400
        
        music_request = data['music'].strip()
        requester_name = data.get('name', 'Anonymous').strip()
        
        if not music_request:
            return jsonify({
                "success": False,
                "error": "Music request cannot be empty"
            }), 400
        
        request_id = mongodb.add_request(music_request, requester_name)
        
        if request_id:
            return jsonify({
                "success": True,
                "message": "Request added successfully",
                "request_id": request_id
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to add request"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@requests_bp.route('/requests/cleanup', methods=['POST'])
def cleanup_requests():
    """Manually trigger cleanup of old requests"""
    try:
        deleted_count = mongodb.cleanup_old_requests()
        return jsonify({
            "success": True,
            "message": f"Cleaned up {deleted_count} old requests"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@requests_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "success": True,
        "message": "Noday'z Entertainment API is running",
        "timestamp": mongodb.requests_collection.estimated_document_count() if mongodb.requests_collection else 0
    })

