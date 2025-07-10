#!/usr/bin/env python3
"""
Simple script to run the Flask development server
"""

import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    print("Starting Flask development server...")
    print("Python path:", sys.path[0])
    
    from src.main import create_app
    print("✅ Successfully imported create_app")
    
    app = create_app()
    print("✅ Successfully created Flask app")
    
    print("🚀 Starting server on http://localhost:5000")
    print("📊 MongoDB connection should be established")
    print("🔧 CORS is configured for development")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)
