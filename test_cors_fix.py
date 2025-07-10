#!/usr/bin/env python3
"""
Test script to verify CORS configuration is working properly
"""

import requests
import json
import sys
import time
from urllib.parse import urljoin

def test_cors_headers(base_url, origin):
    """Test CORS headers for a specific origin"""
    print(f"\n🧪 Testing CORS for origin: {origin}")
    print(f"   Backend URL: {base_url}")
    
    # Test preflight OPTIONS request
    try:
        options_response = requests.options(
            urljoin(base_url, '/api/health'),
            headers={
                'Origin': origin,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        
        print(f"   OPTIONS Status: {options_response.status_code}")
        
        # Check CORS headers in OPTIONS response
        cors_headers = {
            'Access-Control-Allow-Origin': options_response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': options_response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': options_response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': options_response.headers.get('Access-Control-Allow-Credentials')
        }
        
        print("   CORS Headers in OPTIONS response:")
        for header, value in cors_headers.items():
            print(f"     {header}: {value}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ OPTIONS request failed: {e}")
        return False
    
    # Test actual GET request
    try:
        get_response = requests.get(
            urljoin(base_url, '/api/health'),
            headers={'Origin': origin},
            timeout=10
        )
        
        print(f"   GET Status: {get_response.status_code}")
        
        if get_response.status_code == 200:
            data = get_response.json()
            print(f"   Response: {data.get('status', 'unknown')} - {data.get('database', 'unknown')}")
            
            # Check CORS headers in GET response
            cors_headers = {
                'Access-Control-Allow-Origin': get_response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': get_response.headers.get('Access-Control-Allow-Credentials')
            }
            
            print("   CORS Headers in GET response:")
            for header, value in cors_headers.items():
                print(f"     {header}: {value}")
                
            return True
        else:
            print(f"   ❌ GET request failed with status {get_response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ GET request failed: {e}")
        return False

def main():
    """Main test function"""
    print("🔧 CORS Configuration Test")
    print("=" * 50)
    
    # Test configurations
    test_configs = [
        {
            'base_url': 'http://localhost:5000',
            'origins': [
                'https://nodayzentertainment.co.ke',
                'http://localhost:8000',
                'http://127.0.0.1:8000'
            ]
        },
        {
            'base_url': 'https://djnoday2.onrender.com',
            'origins': [
                'https://nodayzentertainment.co.ke',
                'https://www.nodayzentertainment.co.ke'
            ]
        }
    ]
    
    all_tests_passed = True
    
    for config in test_configs:
        base_url = config['base_url']
        print(f"\n🌐 Testing backend: {base_url}")
        
        # First check if the backend is reachable
        try:
            health_response = requests.get(urljoin(base_url, '/api/health'), timeout=10)
            if health_response.status_code != 200:
                print(f"   ⚠️  Backend not reachable (status: {health_response.status_code})")
                continue
        except requests.exceptions.RequestException as e:
            print(f"   ⚠️  Backend not reachable: {e}")
            continue
            
        print(f"   ✅ Backend is reachable")
        
        # Test each origin
        for origin in config['origins']:
            success = test_cors_headers(base_url, origin)
            if not success:
                all_tests_passed = False
    
    print("\n" + "=" * 50)
    if all_tests_passed:
        print("🎉 All CORS tests passed!")
    else:
        print("❌ Some CORS tests failed. Check the configuration.")
        sys.exit(1)

if __name__ == '__main__':
    main()
