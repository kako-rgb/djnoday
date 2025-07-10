from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from src.models.mongodb import mongodb

requests_bp = Blueprint('requests', __name__)

# Helper function to check if a request is expired
def is_expired(request_data):
    created_at = request_data.get('created_at', datetime.utcnow())
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    return datetime.utcnow() - created_at > timedelta(hours=24)

@requests_bp.route('/requests', methods=['GET'])
def get_requests():
    """Get all non-expired live requests"""
        
    try:
        # Get all requests from the last 24 hours
        requests = mongodb.get_requests()
        
        # Filter out expired requests
        non_expired_requests = [req for req in requests if not is_expired(req)]
        
        # Convert ObjectId to string for JSON serialization
        for req in non_expired_requests:
            if '_id' in req:
                req['_id'] = str(req['_id'])
        
        # Delete any expired requests we found
        expired_requests = [req for req in requests if is_expired(req)]
        for req in expired_requests:
            mongodb.delete_request(req['_id'])
        
        return jsonify({
            "success": True,
            "requests": non_expired_requests,
            "count": len(non_expired_requests)
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
                "request_id": str(request_id)
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

@requests_bp.route('/requests/<request_id>', methods=['DELETE'])
def delete_request(request_id):
    """Delete a specific request by ID"""
        
    try:
        if not request_id:
            return jsonify({
                "success": False,
                "error": "Request ID is required"
            }), 400

        result = mongodb.delete_request(request_id)

        if result:
            return jsonify({
                "success": True,
                "message": "Request deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Request not found or could not be deleted"
            }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@requests_bp.route('/requests/cleanup', methods=['POST'])
def cleanup_requests():
    """Manually trigger cleanup of old requests"""
        
    try:
        # Get all requests and delete expired ones
        requests = mongodb.get_requests()
        expired_count = len([req for req in requests if is_expired(req)])
        
        mongodb.cleanup_old_requests()
        
        return jsonify({
            "success": True,
            "message": f"Cleanup completed. Removed {expired_count} expired requests."
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


