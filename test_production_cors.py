#!/usr/bin/env python3
"""
Test script to verify CORS configuration is working in production
"""
import requests
import json

def test_cors():
    """Test CORS configuration"""
    base_url = "https://djnoday2.onrender.com"
    origin = "https://nodayzentertainment.co.ke"
    
    print(f"🧪 Testing CORS configuration...")
    print(f"Backend URL: {base_url}")
    print(f"Origin: {origin}")
    print("-" * 60)
    
    # Test 1: OPTIONS preflight request
    print("1. Testing OPTIONS preflight request...")
    try:
        response = requests.options(
            f"{base_url}/api/health",
            headers={
                'Origin': origin,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        )
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code in [200, 204]:
            print("   ✅ OPTIONS request successful")
        else:
            print("   ❌ OPTIONS request failed")
    except Exception as e:
        print(f"   ❌ OPTIONS request error: {e}")
    
    print()
    
    # Test 2: GET request
    print("2. Testing GET request...")
    try:
        response = requests.get(
            f"{base_url}/api/health",
            headers={
                'Origin': origin,
                'Accept': 'application/json'
            }
        )
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("   ✅ GET request successful")
            try:
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)}")
            except:
                print(f"   Response text: {response.text}")
        else:
            print("   ❌ GET request failed")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ GET request error: {e}")
    
    print()
    
    # Test 3: Root health check
    print("3. Testing root health check...")
    try:
        response = requests.get(
            f"{base_url}/health",
            headers={
                'Origin': origin,
                'Accept': 'application/json'
            }
        )
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("   ✅ Root health check successful")
            try:
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)}")
            except:
                print(f"   Response text: {response.text}")
        else:
            print("   ❌ Root health check failed")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Root health check error: {e}")

if __name__ == "__main__":
    test_cors()