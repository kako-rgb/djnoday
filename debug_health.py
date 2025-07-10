#!/usr/bin/env python3
"""
Debug script to test the health endpoint directly
"""

import requests
import json

def test_health_endpoint():
    try:
        print("🔍 Testing health endpoint...")
        response = requests.get('http://localhost:5000/api/health', timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Success!")
            print(f"Response: {response.json()}")
        else:
            print("❌ Error!")
            print(f"Response Text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused - server not running")
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_health_endpoint()
