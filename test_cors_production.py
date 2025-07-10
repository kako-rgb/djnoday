#!/usr/bin/env python3
"""
Quick test script to verify CORS configuration for production.
"""

import requests
import json

def test_cors_production():
    """Test the production CORS configuration with various requests."""
    base_url = "https://djnoday2.onrender.com/api"
    
    # Endpoints to test
    endpoints = {
        'health': {'methods': ['GET', 'OPTIONS']},
        'requests': {'methods': ['GET', 'POST', 'OPTIONS']},
    }
    
    # Define origins
    allowed_origin = "https://nodayzentertainment.co.ke"
    invalid_origin = "https://evil.com"

    print("🚀 Starting Production CORS Test Suite")
    print("-" * 70)

    # --- Test 1: Allowed Origin ---
    print(f"🔍 Testing ALLOWED origin: {allowed_origin}")
    test_origin(base_url, endpoints, allowed_origin, expect_success=True)
    
    # --- Test 2: Disallowed Origin ---
    print(f"🔍 Testing DISALLOWED origin: {invalid_origin}")
    test_origin(base_url, endpoints, invalid_origin, expect_success=False)

def test_origin(base_url, endpoints, origin, expect_success):
    """Helper function to test a specific origin against all endpoints."""
    headers = {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
    }

    for endpoint, config in endpoints.items():
        url = f"{base_url}/{endpoint}"
        
        # Test OPTIONS (preflight) request
        if 'OPTIONS' in config['methods']:
            test_preflight_request(url, headers, expect_success)
            
        # Test GET request
        if 'GET' in config['methods']:
            test_get_request(url, {'Origin': origin}, expect_success)

        # Test POST request
        if 'POST' in config['methods']:
            test_post_request(url, {'Origin': origin}, expect_success)

def test_preflight_request(url, headers, expect_success):
    """Tests an OPTIONS (preflight) request."""
    print(f"\n  -> Testing OPTIONS: {url}")
    try:
        response = requests.options(url, headers=headers, timeout=10)
        print(f"     Status: {response.status_code}")
        
        if expect_success:
            assert response.status_code in [200, 204], f"Expected 200/204, got {response.status_code}"
            assert response.headers.get('Access-Control-Allow-Origin') == headers['Origin'], "CORS origin mismatch"
            print("     ✅ Preflight check PASSED")
        else:
            # For disallowed origins, the server might:
            # 1. Not send back the ACAO header.
            # 2. Send back a different ACAO.
            # 3. Block the request entirely (though less common for OPTIONS).
            assert 'Access-Control-Allow-Origin' not in response.headers or response.headers.get('Access-Control-Allow-Origin') != headers['Origin'], "CORS header unexpectedly present for disallowed origin"
            print("     ✅ Preflight check CORRECTLY BLOCKED")
            
    except requests.exceptions.RequestException as e:
        print(f"     ❌ FAILED: {e}")

def test_get_request(url, headers, expect_success):
    """Tests a GET request."""
    print(f"\n  -> Testing GET: {url}")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"     Status: {response.status_code}")
        
        if expect_success:
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert response.headers.get('Access-Control-Allow-Origin') == headers['Origin'], "CORS origin mismatch"
            print("     ✅ GET request PASSED")
        else:
            assert 'Access-Control-Allow-Origin' not in response.headers or response.headers.get('Access-Control-Allow-Origin') != headers['Origin'], "CORS header unexpectedly present for disallowed origin"
            print("     ✅ GET request CORRECTLY BLOCKED")

    except requests.exceptions.RequestException as e:
        print(f"     ❌ FAILED: {e}")

def test_post_request(url, headers, expect_success):
    """Tests a POST request."""
    print(f"\n  -> Testing POST: {url}")
    post_headers = {**headers, 'Content-Type': 'application/json'}
    post_data = {"music": "Test Song", "name": "CORS Test"}
    
    try:
        response = requests.post(url, headers=post_headers, json=post_data, timeout=10)
        print(f"     Status: {response.status_code}")

        if expect_success:
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert response.headers.get('Access-Control-Allow-Origin') == headers['Origin'], "CORS origin mismatch"
            print("     ✅ POST request PASSED")
        else:
            assert 'Access-Control-Allow-Origin' not in response.headers or response.headers.get('Access-Control-Allow-Origin') != headers['Origin'], "CORS header unexpectedly present for disallowed origin"
            print("     ✅ POST request CORRECTLY BLOCKED")

    except requests.exceptions.RequestException as e:
        print(f"     ❌ FAILED: {e}")

if __name__ == "__main__":
    test_cors_production()
