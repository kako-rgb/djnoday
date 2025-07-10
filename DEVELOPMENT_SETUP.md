# Development Setup Guide

## 🚀 Quick Start for Local Development

### Prerequisites
- ✅ Python 3.12+ (already installed)
- ✅ All dependencies installed (already done)
- ✅ MongoDB Atlas connection working (already tested)

### Step 1: Start the Backend Server

**Option A: Using the batch file (Windows)**
1. Navigate to `djnoday-main/noday-backend/`
2. Double-click `start_server.bat`
3. The server will start and show connection details

**Option B: Using Command Prompt**
1. Open Command Prompt or PowerShell
2. Navigate to the backend directory:
   ```cmd
   cd "c:\xampp\htdocs\djnoday repo\djnoday-main\noday-backend"
   ```
3. Start the server:
   ```cmd
   python src/main.py
   ```

**Option C: Using the simple test server**
1. Navigate to the backend directory
2. Run the simple test:
   ```cmd
   python simple_test.py
   ```

### Step 2: Start the Frontend Server

1. Open a **new** Command Prompt/PowerShell window
2. Navigate to the frontend directory:
   ```cmd
   cd "c:\xampp\htdocs\djnoday repo\djnoday-main"
   ```
3. Start the frontend server:
   ```cmd
   python -m http.server 8000
   ```

### Step 3: Test the Setup

1. **Backend API Test**: Open http://localhost:5000/api/health in your browser
   - You should see: `{"status": "healthy", "database": "connected", ...}`

2. **Frontend Test**: Open http://localhost:8000 in your browser
   - Your website should load
   - Check the browser console - CORS errors should be gone
   - Database connection indicator should show "connected"

### Expected Server Output

When the backend starts successfully, you should see:
```
🚀 Starting Noday'z Entertainment Backend Server...
Successfully connected to MongoDB Atlas
MongoDB connected successfully
✅ Flask app created successfully
🌐 Server will be available at:
   - http://localhost:5000
   - http://127.0.0.1:5000
📡 API endpoints:
   - GET /api/health (health check)
   - GET /api/requests (get requests)
   - POST /api/requests (add request)
   - DELETE /api/requests/<id> (delete request)
🔧 CORS configured for development and production
Press Ctrl+C to stop the server
------------------------------------------------------------
 * Serving Flask app 'main'
 * Debug mode: on
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

## 🔧 Troubleshooting

### Backend Server Won't Start
1. **Check Python version**: `python --version` (should be 3.12+)
2. **Check dependencies**: `pip list | findstr Flask` (should show Flask 3.1.1)
3. **Check MongoDB connection**: `python test_db_connection.py`
4. **Try the simple test**: `python simple_test.py`

### CORS Errors Still Appearing
1. **Verify backend is running**: Visit http://localhost:5000/api/health
2. **Check frontend URL**: Make sure you're accessing http://localhost:8000
3. **Clear browser cache**: Ctrl+F5 or clear cache and reload
4. **Check browser console**: Look for specific error messages

### Port Already in Use
If you get "port already in use" errors:
1. **Kill existing processes**: 
   ```cmd
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```
2. **Use different port**: Edit `src/main.py` and change port to 5001

### MongoDB Connection Issues
1. **Test connection**: `python test_db_connection.py`
2. **Check internet**: MongoDB Atlas requires internet connection
3. **Firewall**: Ensure Python can access the internet

## 📱 Testing the Fix

### Frontend Console (should be clean)
Open browser console (F12) and look for:
- ✅ "Database connection check started"
- ✅ "Application initialization complete!"
- ❌ No CORS errors
- ❌ No "Failed to fetch" errors

### Backend Logs (should show requests)
When frontend connects, backend should show:
```
127.0.0.1 - - [date] "GET /api/health HTTP/1.1" 200 -
127.0.0.1 - - [date] "OPTIONS /api/health HTTP/1.1" 204 -
```

## 🎯 Success Indicators

### ✅ Everything Working Correctly:
1. Backend server starts without errors
2. MongoDB connection successful
3. Frontend loads at http://localhost:8000
4. No CORS errors in browser console
5. Database status indicator shows "connected"
6. API requests work (you can add/view music requests)

### ❌ Still Having Issues:
1. Backend server won't start → Check Python/dependencies
2. CORS errors persist → Verify both servers are running
3. Database connection fails → Check internet/MongoDB Atlas
4. Frontend won't load → Check if port 8000 is available

## 📞 Next Steps

Once local development is working:
1. **Test all features**: Add music requests, view requests, etc.
2. **Deploy backend changes**: Push to Render to fix production CORS
3. **Verify production**: Test https://nodayzentertainment.co.ke

## 🔗 Useful URLs

- **Frontend (Development)**: http://localhost:8000
- **Backend API (Development)**: http://localhost:5000/api/health
- **Frontend (Production)**: https://nodayzentertainment.co.ke
- **Backend API (Production)**: https://djnoday2.onrender.com/api/health
- **CORS Test Page**: http://localhost:8000/cors_test_page.html
