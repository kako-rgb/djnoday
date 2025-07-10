# Noday'z Entertainment Website - Complete Documentation

## Project Overview

This is a comprehensive entertainment website for Noday'z Entertainment featuring multiple sections including karaoke, DJ mixes, video player, and live music requests. The website is built with modern web technologies and includes both frontend and backend components.

## Features

### 🎤 Karaoke @ Cafe AMKA
- Browse karaoke songs by categories (Arabic, Chinese, Dancehall, EastAfrican, International, Gospel, Lingala, Roots, Traditional, Naija, Xmass)
- Search functionality for finding specific songs
- Karaoke videos section with clickable video playback
- Different song lists for Cafe AMKA and DJ Noday sections

### 🎵 DJ Noday & Sax-Afrophonist
- Similar category-based song browsing
- Separate song collection from Cafe AMKA
- Non-clickable song lists (audio only)
- No karaoke videos button in this section

### 🎬 MIXXEZ
- Video grid layout with 12 different DJ mix videos
- Clickable video thumbnails
- Video player modal with controls
- Auto-close functionality when video ends
- Thumbnail navigation within player

### 📝 Live Request
- Real-time music request submission
- MongoDB integration for data persistence
- 12-hour auto-deletion of old requests
- Instant display of new requests
- Optional name field for requesters

## Technology Stack

### Frontend
- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with animations and responsive design
- **JavaScript (ES6+)** - Interactive functionality and API integration
- **Responsive Design** - Mobile-first approach with breakpoints

### Backend
- **Flask** - Python web framework
- **MongoDB Atlas** - Cloud database for live requests
- **CORS** - Cross-origin resource sharing enabled
- **RESTful API** - Clean API endpoints for data operations

### Additional Features
- **Smooth Animations** - CSS transitions and keyframe animations
- **Accessibility** - Reduced motion and high contrast support
- **Progressive Enhancement** - Fallback to localStorage if MongoDB unavailable
- **Auto-cleanup** - Background task for removing old requests

## File Structure

```
noday-entertainment/
├── index.html                 # Main HTML file
├── styles.css                 # Complete CSS styling
├── script.js                  # JavaScript functionality
├── todo.md                    # Project progress tracker
├── assets/
│   ├── images/
│   │   ├── home.jpg          # Background image
│   │   ├── finalNoday.jpg    # Reference images
│   │   ├── karaoke.jpg
│   │   ├── karaoke2.jpg
│   │   ├── mixxz.jpg
│   │   ├── mixxz2.jpg
│   │   └── video-thumb-*.jpg # Video thumbnails (1-12)
│   ├── videos/               # Video files directory
│   └── audio/                # Audio files directory
├── data/
│   ├── karaoke-cafe.json     # Karaoke cafe songs data
│   ├── dj-noday.json         # DJ Noday songs data
│   └── videos.json           # Video metadata
└── noday-backend/            # Flask backend application
    ├── src/
    │   ├── main.py           # Flask application entry point
    │   ├── models/
    │   │   └── mongodb.py    # MongoDB connection and operations
    │   └── routes/
    │       └── requests.py   # API routes for live requests
    ├── venv/                 # Python virtual environment
    └── requirements.txt      # Python dependencies
```

## Setup Instructions

### Prerequisites
- Python 3.11 or higher
- Node.js (optional, for additional development tools)
- MongoDB Atlas account (for live requests)
- Modern web browser

### Local Development Setup

1. **Clone or extract the project files**
   ```bash
   cd noday-entertainment
   ```

2. **Set up the frontend**
   ```bash
   # Start a simple HTTP server for the frontend
   python3 -m http.server 8000
   ```

3. **Set up the backend**
   ```bash
   cd noday-backend
   
   # Activate virtual environment
   source venv/bin/activate
   
   # Install dependencies (already included)
   pip install -r requirements.txt
   
   # Start the Flask server
   python src/main.py
   ```

4. **Access the application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:5000

### MongoDB Configuration

The application is configured to use MongoDB Atlas with the connection string:
```
mongodb+srv://kakotechnology:9w4VSWqNmwonsF@cluster0.dfv4h.mongodb.net/
```

If MongoDB is unavailable, the application automatically falls back to localStorage for live requests.

### Production Deployment

#### Frontend Deployment (Netlify)
1. Build the frontend assets
2. Deploy to Netlify at: https://nodayzentertainment.co.ke/
3. Configure custom domain if needed

#### Backend Deployment (Render)
1. Deploy Flask backend to Render
2. Set environment variables for MongoDB connection
3. Access at: https://nodayz.onrender.com

## API Endpoints

### Live Requests API

#### GET /api/requests
- **Description**: Retrieve all live requests from the last 12 hours
- **Response**: JSON array of request objects
- **Example**:
  ```json
  {
    "success": true,
    "requests": [
      {
        "music": "Wizkid - Essence",
        "name": "John",
        "timestamp": "2025-06-12T17:53:58.123Z",
        "number": 1
      }
    ],
    "count": 1
  }
  ```

#### POST /api/requests
- **Description**: Submit a new music request
- **Body**:
  ```json
  {
    "music": "Song title - Artist",
    "name": "Requester name (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Request added successfully",
    "request_id": "unique_id"
  }
  ```

#### POST /api/requests/cleanup
- **Description**: Manually trigger cleanup of old requests
- **Response**:
  ```json
  {
    "success": true,
    "message": "Cleaned up X old requests"
  }
  ```

#### GET /api/health
- **Description**: Health check endpoint
- **Response**:
  ```json
  {
    "success": true,
    "message": "Noday'z Entertainment API is running",
    "timestamp": 1234567890
  }
  ```

## Data Management

### Song Categories
Both karaoke sections include the following categories:
- **Arabic** - Middle Eastern music
- **Chinese** - Mandarin and Cantonese songs
- **Dancehall** - Jamaican dancehall hits
- **EastAfrican** - Tanzanian, Kenyan, Ugandan music
- **International** - Global pop hits
- **Gospel** - Christian worship music
- **Lingala** - Congolese and Central African music
- **Roots** - Reggae and conscious music
- **Traditional** - African traditional music
- **Naija** - Nigerian Afrobeats
- **Xmass** - Holiday and Christmas songs

### Video Collection
The MIXXEZ section includes 12 video mixes:
1. Afrobeats Fusion Mix
2. Dancehall Vibes Session
3. East African Hits Compilation
4. International Chart Toppers
5. Lingala Classics Revival
6. Gospel Praise Mix
7. Roots & Culture Special
8. Naija Afrobeats Explosion
9. Arabic Fusion Experience
10. Traditional Meets Modern
11. Chinese Pop Remix Collection
12. Holiday Special Mix

### Live Requests
- Automatic 12-hour expiration
- Real-time display updates
- MongoDB persistence with localStorage fallback
- Request numbering and timestamps

## Customization Guide

### Adding New Songs
1. Edit the appropriate JSON file in the `data/` directory
2. Add songs to the desired category array
3. Follow the format: "Song Title ~ Artist Name"

### Adding New Videos
1. Add video files to `assets/videos/` directory
2. Create thumbnail images in `assets/images/`
3. Update `data/videos.json` with new video metadata

### Styling Modifications
- Main colors defined in CSS custom properties
- Responsive breakpoints at 768px and 480px
- Animation durations and easing functions configurable
- Dark mode and accessibility features included

### Backend Configuration
- MongoDB connection string in `src/models/mongodb.py`
- CORS settings in `src/main.py`
- API rate limiting can be added in routes
- Background cleanup interval configurable

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Features Used
- CSS Grid and Flexbox
- ES6+ JavaScript features
- Fetch API for HTTP requests
- CSS Custom Properties
- CSS Animations and Transitions

## Performance Optimization

### Frontend
- Optimized CSS with minimal reflows
- Efficient JavaScript event handling
- Lazy loading for video content
- Compressed image assets

### Backend
- MongoDB connection pooling
- Efficient database queries with indexes
- Background cleanup tasks
- CORS optimization

## Security Considerations

### Frontend
- Input sanitization for user requests
- XSS prevention in dynamic content
- HTTPS enforcement in production

### Backend
- CORS properly configured
- Input validation on all endpoints
- MongoDB injection prevention
- Rate limiting recommended for production

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check internet connection
   - Verify MongoDB Atlas credentials
   - Application falls back to localStorage automatically

2. **Videos Not Playing**
   - Ensure video files are in correct directory
   - Check file formats (MP4 recommended)
   - Verify MIME types are configured

3. **Responsive Design Issues**
   - Clear browser cache
   - Check viewport meta tag
   - Test on actual devices

4. **API Requests Failing**
   - Verify backend server is running
   - Check CORS configuration
   - Confirm API endpoints are accessible

### Debug Mode
Enable debug mode by setting `debug=True` in Flask configuration for detailed error messages.

## Future Enhancements

### Planned Features
- User authentication system
- Playlist creation and management
- Social sharing capabilities
- Advanced search filters
- Audio visualization
- Offline mode support

### Technical Improvements
- WebSocket integration for real-time updates
- Progressive Web App (PWA) features
- Advanced caching strategies
- Performance monitoring
- Automated testing suite

## Support and Maintenance

### Regular Maintenance
- Monitor MongoDB storage usage
- Update dependencies regularly
- Review and optimize database queries
- Check for broken links and media files

### Backup Strategy
- Regular MongoDB backups
- Version control for code changes
- Asset file backups
- Configuration documentation

## License and Credits

This project was created for Noday'z Entertainment. All music and video content should be properly licensed for public use.

### Third-party Libraries
- Flask (BSD License)
- PyMongo (Apache License 2.0)
- Flask-CORS (MIT License)

### Design Credits
- Original design concepts from provided reference images
- Custom CSS animations and transitions
- Responsive design patterns

---

For technical support or questions about this documentation, please refer to the project repository or contact the development team.

