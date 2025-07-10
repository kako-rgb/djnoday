"""
Deployment health check module
This module provides health checks specifically for deployment environments
"""
from flask import Blueprint, jsonify, request
import os
import sys

deployment_health_bp = Blueprint('deployment_health', __name__)

@deployment_health_bp.route('/health', methods=['GET', 'OPTIONS'])
def deployment_health_check():
    """Simple health check for deployment"""
    print(f"🔍 Deployment health check - Method: {request.method}")
    
    if request.method == 'OPTIONS':
        print("🔧 Handling OPTIONS for deployment health")
        return '', 204
    
    return jsonify({
        'status': 'healthy',
        'message': 'Deployment server is running',
        'environment': os.environ.get('FLASK_ENV', 'production'),
        'python_version': sys.version,
        'platform': sys.platform
    }), 200

@deployment_health_bp.route('/api/health', methods=['GET', 'OPTIONS'])
def api_deployment_health_check():
    """API health check for deployment"""
    print(f"🔍 API deployment health check - Method: {request.method}")
    
    if request.method == 'OPTIONS':
        print("🔧 Handling OPTIONS for API deployment health")
        return '', 204
    
    return jsonify({
        'status': 'healthy',
        'message': 'API server is running',
        'environment': os.environ.get('FLASK_ENV', 'production'),
        'endpoint': '/api/health'
    }), 200

@deployment_health_bp.route('/ping', methods=['GET', 'OPTIONS'])
def ping():
    """Simple ping endpoint"""
    print(f"🏓 Ping - Method: {request.method}")
    
    if request.method == 'OPTIONS':
        return '', 204
    
    return jsonify({'message': 'pong'}), 200