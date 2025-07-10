#!/usr/bin/env python3
"""
Simple test to verify Flask app works
"""

import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, jsonify, request
from functools import wraps

# Create a simple test Flask app
app = Flask(__name__)

# Add CORS headers to all responses
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if request.method == 'OPTIONS':
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

app.after_request(add_cors_headers)

@app.route('/test')
def test():
    return jsonify({"status": "working", "message": "Simple Flask test successful"})

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':        return jsonify({}), 200    
    return jsonify({
        "status": "healthy",
        "database": "test_mode",
        "message": "Simple health check"
    })

# Add a test endpoint for the frontend
@app.route('/api/test-connection', methods=['GET', 'OPTIONS'])
def test_connection():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    return jsonify({
        "success": True,
        "message": "Backend connection successful!",
        "version": "1.0.0"
    })

# Mock requests endpoint
@app.route('/api/requests', methods=['GET', 'POST', 'OPTIONS'])
def handle_requests():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    if request.method == 'GET':
        # Return mock requests
        return jsonify({
            "success": True,
            "requests": [
                {
                    "id": "1",
                    "musicRequest": "Test Song 1",
                    "requesterName": "Test User",
                    "timestamp": "2025-07-08T15:00:00Z"
                },
                {
                    "id": "2",
                    "musicRequest": "Test Song 2",
                    "requesterName": "Another User",
                    "timestamp": "2025-07-08T15:30:00Z"
                }
            ]
        })
    elif request.method == 'POST':
        # Handle new request
        data = request.get_json()
        return jsonify({
            "success": True,
            "message": "Request received",
            "request": {
                "id": str(len(data) + 1) if data else "1",
                "musicRequest": data.get('musicRequest', ''),
                "requesterName": data.get('requesterName', 'Anonymous'),
                "timestamp": "2025-07-08T15:45:00Z"
            }
        })

if __name__ == '__main__':
    print("🧪 Starting simple Flask test server...")
    print("🌐 Test endpoints:")
    print("   - http://localhost:5000/test")
    print("   - http://localhost:5000/api/health")
    print("Press Ctrl+C to stop")
    print("-" * 40)
    
    try:
        app.run(host='127.0.0.1', port=5000, debug=False)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
