from flask import Blueprint, request, jsonify, make_response
from flask_cors import cross_origin
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from src.models.mongodb import mongodb

def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://nodayzentertainment.co.ke')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '600')
    response.headers.add('Access-Control-Expose-Headers', 'Content-Type, X-Total-Count')
    return response

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
        
        response = jsonify({
            "success": True,
            "requests": non_expired_requests,
            "count": len(non_expired_requests)
        })
        response = add_cors_headers(response)
        return response
    except Exception as e:
        error_response = jsonify({
            "success": False,
            "error": str(e)
        })
        error_response = add_cors_headers(error_response)
        return error_response, 500

@requests_bp.route('/requests', methods=['POST'])
def add_request():
    """Add a new live request"""
        
    try:
        data = request.get_json()
        
        if not data or 'music' not in data:
            error_response = jsonify({
                "success": False,
                "error": "Music request is required"
            })
            error_response = add_cors_headers(error_response)
            return error_response, 400
        
        music_request = data['music'].strip()
        requester_name = data.get('name', 'Anonymous').strip()
        
        if not music_request:
            error_response = jsonify({
                "success": False,
                "error": "Music request cannot be empty"
            })
            error_response = add_cors_headers(error_response)
            return error_response, 400
        
        request_id = mongodb.add_request(music_request, requester_name)
        
        if request_id:
            response = jsonify({
                "success": True,
                "message": "Request added successfully",
                "request_id": str(request_id)
            })
            response = add_cors_headers(response)
            return response
        else:
            error_response = jsonify({
                "success": False,
                "error": "Failed to add request"
            })
            error_response = add_cors_headers(error_response)
            return error_response, 500
            
    except Exception as e:
        error_response = jsonify({
            "success": False,
            "error": str(e)
        })
        error_response = add_cors_headers(error_response)
        return error_response, 500

@requests_bp.route('/requests/<request_id>', methods=['DELETE'])
def delete_request(request_id):
    """Delete a specific request by ID"""
        
    try:
        if not request_id:
            error_response = jsonify({
                "success": False,
                "error": "Request ID is required"
            })
            error_response = add_cors_headers(error_response)
            return error_response, 400
            
        result = mongodb.delete_request(request_id)
        
        if result:
            response = jsonify({
                "success": True,
                "message": "Request deleted successfully"
            })
            response = add_cors_headers(response)
            return response
        else:
            error_response = jsonify({
                "success": False,
                "error": "Request not found or could not be deleted"
            })
            error_response = add_cors_headers(error_response)
            return error_response, 404
            
    except Exception as e:
        error_response = jsonify({
            "success": False,
            "error": str(e)
        })
        error_response = add_cors_headers(error_response)
        return error_response, 500

@requests_bp.route('/requests/cleanup', methods=['POST'])
def cleanup_requests():
    """Manually trigger cleanup of old requests"""
        
    try:
        # Get all requests and delete expired ones
        requests = mongodb.get_requests()
        expired_count = len([req for req in requests if is_expired(req)])
        
        mongodb.cleanup_old_requests()
        
        response = jsonify({
            "success": True,
            "message": f"Cleanup completed. Removed {expired_count} expired requests."
        })
        response = add_cors_headers(response)
        return response
    except Exception as e:
        error_response = jsonify({
            "success": False,
            "error": str(e)
        })
        error_response = add_cors_headers(error_response)
        return error_response, 500
