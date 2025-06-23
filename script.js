// Global variables
let currentPage = 'home-page';
let karaokeData = {};
let djData = {};
let videoData = {};
let requests = [];

// Environment configuration
const config = {
    apiBaseUrl: window.location.hostname === 'nodayzentertainment.co.ke' 
        ? 'https://djnoday2.onrender.com' 
        : 'http://localhost:5000',  // For development
    isProduction: window.location.hostname === 'nodayzentertainment.co.ke'
};

// Add CORS credentials for cross-origin requests
const fetchOptions = {
    mode: 'cors',
    credentials: 'include',  // Include cookies and authorization headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Check database connection status
async function checkDatabaseConnection() {
    const statusIndicator = document.getElementById('db-status-indicator');
    if (!statusIndicator) return false;
    
    try {
        console.log(`Attempting to connect to: ${config.apiBaseUrl}/api/health`);
        
        // First try a simple fetch with minimal options
        const response = await fetch(`${config.apiBaseUrl}/api/health`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'omit'  // Try without credentials first
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Health check response:', data);
            if (data.status === 'healthy' && data.database === 'connected') {
                statusIndicator.classList.add('connected');
                statusIndicator.title = 'Database connected';
                return true;
            }
        } else {
            console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error('Database connection check failed:', error);
        
        // Try alternative approach for CORS issues
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log('Trying alternative connection method...');
            try {
                // Try with a different approach - using no-cors mode for ping
                const pingResponse = await fetch(`${config.apiBaseUrl}/api/health`, {
                    method: 'GET',
                    mode: 'no-cors'
                });
                console.log('No-cors ping attempt completed');
                
                // In production, assume connection is working if no error thrown
                if (config.isProduction) {
                    statusIndicator.classList.add('connected');
                    statusIndicator.title = 'Database connection assumed (CORS limitation)';
                    return true;
                }
            } catch (pingError) {
                console.error('Ping attempt also failed:', pingError);
            }
        }
        
        // In production, we might want to be more resilient
        if (config.isProduction) {
            console.log('Running in production, will retry...');
            // Return true to prevent showing disconnected state for temporary issues in production
            return true;
        }
    }
    
    // If we get here, connection failed
    statusIndicator.classList.remove('connected');
    statusIndicator.title = 'Database disconnected';
    return false;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    
    try {
        initializeNavigation();
        console.log('Navigation initialized');
        
        loadData();
        console.log('Data loading started');
        
        initializeSearch();
        console.log('Search initialized');
        
        initializeVideoPlayer();
        console.log('Video player initialized');
        
        initializeLiveRequests();
        console.log('Live requests initialized');
        
        initializeBrowserNavigation();
        console.log('Browser navigation initialized');
        
        // Load existing requests from localStorage
        loadRequestsFromStorage();
        console.log('Requests loaded from storage');
        
        // Start cleanup timer for old requests
        startRequestCleanup();
        console.log('Request cleanup timer started');
        
        // Check database connection status and set up periodic checks
        checkDatabaseConnection();
        setInterval(checkDatabaseConnection, 30000); // Check every 30 seconds
        console.log('Database connection check started');
        
        console.log('Application initialization complete!');
    } catch (error) {
        console.error('Error during application initialization:', error);
    }
});

// Navigation functionality
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    // Home page navigation buttons
    const navButtons = document.querySelectorAll('.nav-button');
    console.log(`Found ${navButtons.length} navigation buttons`);
    
    navButtons.forEach((button, index) => {
        const target = button.getAttribute('data-target');
        console.log(`Setting up button ${index}: target = ${target}`);
        
        button.addEventListener('click', function(event) {
            console.log(`Navigation button clicked: ${target}`);
            event.preventDefault();
            event.stopPropagation();
            navigateToPage(target);
        });
        
        // Make sure the button is clickable
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
    });
    
    // Back buttons
    const backButtons = document.querySelectorAll('.back-button');
    console.log(`Found ${backButtons.length} back buttons`);
    
    backButtons.forEach((button, index) => {
        console.log(`Setting up back button ${index}`);
        button.addEventListener('click', function(event) {
            console.log('Back button clicked');
            event.preventDefault();
            event.stopPropagation();
            navigateToPage('home-page');
        });
        
        // Make sure the button is clickable
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
    });
}

function navigateToPage(pageId, updateHistory = true) {
    console.log(`Navigating to page: ${pageId}`);
    
    // Hide current page
    const currentPageElement = document.getElementById(currentPage);
    if (currentPageElement) {
        currentPageElement.classList.remove('active');
        console.log(`Hidden current page: ${currentPage}`);
    }
    
    // Show target page
    const targetPageElement = document.getElementById(pageId);
    if (targetPageElement) {
        targetPageElement.classList.add('active');
        currentPage = pageId;
        console.log(`Showing target page: ${pageId}`);
        
        // Update browser history
        if (updateHistory) {
            if (pageId === 'home-page') {
                history.pushState({ page: pageId }, '', '/');
            } else {
                history.pushState({ page: pageId }, '', `/#${pageId}`);
            }
        }
        
        // Initialize page-specific functionality
        switch(pageId) {
            case 'karaoke-cafe':
                console.log('Initializing karaoke categories...');
                initializeKaraokeCategories('karaoke');
                break;
            case 'dj-noday':
                console.log('Initializing DJ categories...');
                initializeDJCategories();
                break;
            case 'karaoke-videos':
                console.log('Initializing karaoke videos page...');
                initializeKaraokeVideosPage();
                break;
            case 'mixxez':
                console.log('Initializing video grid...');
                initializeVideoGrid();
                break;
            case 'live-request':
                console.log('Loading requests from server...');
                loadRequestsFromServer();
                break;
        }
    } else {
        console.error(`Target page element not found: ${pageId}`);
    }
}

// Browser navigation functionality
function initializeBrowserNavigation() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            navigateToPage(event.state.page, false);
        } else {
            navigateToPage('home-page', false);
        }
    });
    
    // Set initial state
    history.replaceState({ page: 'home-page' }, '', '/');
    
    // Handle hash-based navigation on page load
    if (window.location.hash) {
        const pageId = window.location.hash.substr(1);
        const validPages = ['home-page', 'karaoke-cafe', 'dj-noday', 'mixxez', 'live-request'];
        if (validPages.includes(pageId)) {
            navigateToPage(pageId, false);
        }
    }
}

// Data loading functionality
async function loadData() {
    try {
        // Load karaoke data
        const karaokeResponse = await fetch('data/karaoke-cafe.json');
        if (karaokeResponse.ok) {
            karaokeData = await karaokeResponse.json();
        }
        
        // Load DJ data
        const djResponse = await fetch('data/dj-noday.json');
        if (djResponse.ok) {
            djData = await djResponse.json();
        }
        
        // Load video data
        const videoResponse = await fetch('data/videos.json');
        if (videoResponse.ok) {
            videoData = await videoResponse.json();
        }
    } catch (error) {
        console.log('Data files not found, using default data');
        loadDefaultData();
    }
}

function loadDefaultData() {
    // Default karaoke data
    karaokeData = {
        categories: {
            'Arabic': [
                'Amarain ~ Amr Diab',
                'Macarena ~ Los Del Rio',
                'Nour El Ein (Habibi) (Inst.) ~ Amr Diab',
                'Simarik ~ Tarkan',
                'Yo Yo Honey Singh ~ DIL Chori -Simar-Kaur'
            ],
            'Chinese': [
                'Mo Li Hua ~ Traditional',
                'Teresa Teng ~ The Moon Represents My Heart',
                'Jay Chou ~ Blue and White Porcelain'
            ],
            'Dancehall': [
                'Sean Paul ~ Temperature',
                'Shaggy ~ Boombastic',
                'Bob Marley ~ One Love'
            ],
            'EastAfrican': [
                'Diamond Platnumz ~ Jeje',
                'Sauti Sol ~ Melanin',
                'Burna Boy ~ Ye'
            ],
            'International': [
                'Ed Sheeran ~ Shape of You',
                'Adele ~ Rolling in the Deep',
                'Bruno Mars ~ Uptown Funk'
            ],
            'Gospel': [
                'Amazing Grace ~ Traditional',
                'How Great Thou Art ~ Traditional',
                'Blessed Assurance ~ Traditional'
            ],
            'Lingala': [
                'Koffi Olomide ~ Loi',
                'Papa Wemba ~ Maria Valencia',
                'Werrason ~ Solola Bien'
            ],
            'Roots': [
                'Bob Marley ~ No Woman No Cry',
                'Jimmy Cliff ~ The Harder They Come',
                'Peter Tosh ~ Legalize It'
            ],
            'Traditional': [
                'Kikuyu Traditional ~ Mugithi',
                'Luo Traditional ~ Benga',
                'Kalenjin Traditional ~ Folk'
            ],
            'Naija': [
                'Wizkid ~ Essence',
                'Davido ~ Fall',
                'Burna Boy ~ Last Last'
            ],
            'Xmass': [
                'Jingle Bells ~ Traditional',
                'Silent Night ~ Traditional',
                'White Christmas ~ Bing Crosby'
            ]
        }
    };
    
    // Default DJ data (different from karaoke)
    djData = {
        categories: {
            'Arabic': [
                'Hakim ~ Ya Msafer',
                'Nancy Ajram ~ Ah W Noss',
                'Fairuz ~ Li Beirut'
            ],
            'Chinese': [
                'Faye Wong ~ Eyes on Me',
                'Andy Lau ~ Wang Qing Shui',
                'Jacky Cheung ~ Kiss Goodbye'
            ],
            'Dancehall': [
                'Vybz Kartel ~ Fever',
                'Popcaan ~ Family',
                'Alkaline ~ Champion Boy'
            ],
            'EastAfrican': [
                'Harmonize ~ Kwa Ngwaru',
                'Rayvanny ~ Tetema',
                'Zuchu ~ Sukari'
            ],
            'International': [
                'The Weeknd ~ Blinding Lights',
                'Dua Lipa ~ Levitating',
                'Post Malone ~ Circles'
            ],
            'Gospel': [
                'Kirk Franklin ~ Stomp',
                'Yolanda Adams ~ Open My Heart',
                'Donnie McClurkin ~ We Fall Down'
            ],
            'Lingala': [
                'Fally Ipupa ~ Eloko Oyo',
                'Innoss B ~ Yope',
                'Gims ~ Sapés Comme Jamais'
            ],
            'Roots': [
                'Chronixx ~ Here Comes Trouble',
                'Protoje ~ Who Knows',
                'Koffee ~ Toast'
            ],
            'Traditional': [
                'Benga Classics ~ Various',
                'Taarab ~ Coastal Traditional',
                'Ohangla ~ Luo Traditional'
            ],
            'Naija': [
                'Rema ~ Calm Down',
                'Asake ~ Sungba',
                'Fireboy DML ~ Peru'
            ],
            'Xmass': [
                'Mariah Carey ~ All I Want for Christmas',
                'Wham! ~ Last Christmas',
                'Band Aid ~ Do They Know It\'s Christmas'
            ]
        }
    };
    
    // Default video data
    videoData = {
        videos: [
            {
                id: 1,
                title: 'DJ Noday Mix 1',
                artist: 'DJ Noday',
                thumbnail: 'assets/images/video-thumb-1.jpg',
                videoUrl: 'assets/videos/mix1.mp4'
            },
            {
                id: 2,
                title: 'Afrobeats Session',
                artist: 'DJ Noday',
                thumbnail: 'assets/images/video-thumb-2.jpg',
                videoUrl: 'assets/videos/mix2.mp4'
            },
            {
                id: 3,
                title: 'Dancehall Vibes',
                artist: 'DJ Noday',
                thumbnail: 'assets/images/video-thumb-3.jpg',
                videoUrl: 'assets/videos/mix3.mp4'
            },
            {
                id: 4,
                title: 'East African Hits',
                artist: 'DJ Noday',
                thumbnail: 'assets/images/video-thumb-4.jpg',
                videoUrl: 'assets/videos/mix4.mp4'
            },
            {
                id: 5,
                title: 'International Mix',
                artist: 'DJ Noday',
                thumbnail: 'assets/images/video-thumb-5.jpg',
                videoUrl: 'assets/videos/mix5.mp4'
            },
            {
                id: 6,
                title: 'Gospel Praise',
                artist: 'DJ Noday',
                thumbnail: 'assets/images/video-thumb-6.jpg',
                videoUrl: 'assets/videos/mix6.mp4'
            }
        ]
    };
}

// Karaoke functionality
function initializeKaraokeCategories(type) {
    const data = type === 'karaoke' ? karaokeData : djData;
    const categoriesContainer = document.getElementById(type === 'karaoke' ? 'karaoke-categories' : 'dj-categories');
    const songsContainer = document.getElementById(type === 'karaoke' ? 'karaoke-songs-list' : 'dj-songs-list');
    const selectedCategoryElement = document.getElementById(type === 'karaoke' ? 'selected-category' : 'dj-selected-category');
    
    if (!categoriesContainer || !data.categories) return;
    
    categoriesContainer.innerHTML = '';
    
    Object.keys(data.categories).forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.textContent = category;
        categoryElement.addEventListener('click', function() {
            // Remove active class from all categories
            categoriesContainer.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked category
            this.classList.add('active');
            
            // Update selected category title
            selectedCategoryElement.textContent = category;
            
            // Display songs for this category
            displaySongs(data.categories[category], songsContainer, type);
        });
        
        categoriesContainer.appendChild(categoryElement);
    });
    
    // Karaoke videos button functionality (only for karaoke-cafe)
    if (type === 'karaoke') {
        const karaokeVideosBtn = document.getElementById('karaoke-videos-btn');
        if (karaokeVideosBtn) {
            karaokeVideosBtn.addEventListener('click', function() {
                showKaraokeVideos();
            });
        }
    }
}

function initializeDJCategories() {
    initializeKaraokeCategories('dj');
}

function displaySongs(songs, container, type) {
    if (!container) return;
    
    container.innerHTML = '';
    
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        
        // Only karaoke videos are clickable, regular karaoke and DJ songs are not
        if (type === 'karaoke-videos') {
            songElement.classList.add('clickable');
            songElement.addEventListener('click', function() {
                playKaraokeVideo(song);
            });
        }
        
        songElement.textContent = song;
        container.appendChild(songElement);
    });
}

function showKaraokeVideos() {
    // Navigate to the karaoke videos page
    navigateToPage('karaoke-videos');
}

function playKaraokeVideo(songTitle) {
    // Create a dummy video URL for demo purposes
    const videoUrl = `assets/videos/karaoke/${songTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.mp4`;
    openVideoPlayer(videoUrl, songTitle);
}

// Karaoke Videos Page functionality
function initializeKaraokeVideosPage() {
    loadKaraokeVideosFromDirectory();
    initializeKaraokeVideosSearch();
}

async function loadKaraokeVideosFromDirectory() {
    try {
        // Get the directory structure from assets/videos/
        const categories = ['Amapiano', 'East', 'Gospel', 'International', 'Lingala', 'Reggae'];
        const categoriesContainer = document.getElementById('karaoke-videos-categories');
        const videosGrid = document.getElementById('karaoke-videos-grid');
        const selectedCategoryElement = document.getElementById('karaoke-videos-selected-category');
        
        if (!categoriesContainer) return;
        
        categoriesContainer.innerHTML = '';
        
        // Create category items
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.textContent = category;
            categoryElement.addEventListener('click', () => {
                // Remove active class from all categories
                categoriesContainer.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Add active class to clicked category
                categoryElement.classList.add('active');
                // Update selected category title
                selectedCategoryElement.textContent = category;
                // Load videos for this category
                loadVideosForCategory(category);
            });
            categoriesContainer.appendChild(categoryElement);
        });
        
    } catch (error) {
        console.error('Error loading karaoke videos:', error);
    }
}

function loadVideosForCategory(category) {
    const videosGrid = document.getElementById('karaoke-videos-grid');
    if (!videosGrid) return;
    
    // Create demo video data for the category
    // In a real implementation, you would scan the directory for actual video files
    const demoVideos = generateDemoVideosForCategory(category);
    
    videosGrid.innerHTML = '';
    
    demoVideos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-thumbnail';
        videoElement.innerHTML = `
            <div class="video-thumbnail-container">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+S2FyYW9rZTwvdGV4dD4KPC9zdmc+'">
                <div class="video-duration">${video.duration || '3:30'}</div>
                <div class="play-overlay">
                    <div class="play-button">▶</div>
                </div>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.artist}</p>
                <span class="video-description">${video.description || 'Karaoke video'}</span>
            </div>
        `;
        
        videoElement.addEventListener('click', function() {
            openVideoPlayer(video.videoUrl, video.title);
        });
        
        videosGrid.appendChild(videoElement);
    });
}

function generateDemoVideosForCategory(category) {
    // Generate demo video data based on category
    const baseVideos = {
        'Amapiano': [
            { title: 'Ke Star', artist: 'Focalistic ft. Davido' },
            { title: 'Jerusalema', artist: 'Master KG ft. Nomcebo' },
            { title: 'Adiwele', artist: 'Kabza De Small' }
        ],
        'East': [
            { title: 'Wamlambez', artist: 'Sailors' },
            { title: 'Tano Tena', artist: 'Trio Mio' },
            { title: 'Form Today', artist: 'Khaligraph Jones' }
        ],
        'Gospel': [
            { title: 'Yesu Ndiye Raha', artist: 'Rose Muhando' },
            { title: 'Mwanga', artist: 'Christina Shusho' },
            { title: 'Bwana Asifiwe', artist: 'Goodluck Gozbert' }
        ],
        'International': [
            { title: 'Blinding Lights', artist: 'The Weeknd' },
            { title: 'Levitating', artist: 'Dua Lipa' },
            { title: 'As It Was', artist: 'Harry Styles' }
        ],
        'Lingala': [
            { title: 'Eloko Oyo', artist: 'Fally Ipupa' },
            { title: 'Yope', artist: 'Innoss B' },
            { title: 'Sapés Comme Jamais', artist: 'Gims' }
        ],
        'Reggae': [
            { title: 'Here Comes Trouble', artist: 'Chronixx' },
            { title: 'Who Knows', artist: 'Protoje' },
            { title: 'Toast', artist: 'Koffee' }
        ]
    };
    
    const videos = baseVideos[category] || [];
    return videos.map((video, index) => ({
        id: `${category.toLowerCase()}-${index + 1}`,
        title: video.title,
        artist: video.artist,
        thumbnail: `assets/images/karaoke-thumb-${category.toLowerCase()}-${index + 1}.jpg`,
        videoUrl: `assets/videos/${category}/${video.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.mp4`,
        duration: '3:30',
        description: `Karaoke version of ${video.title}`
    }));
}

function initializeKaraokeVideosSearch() {
    const searchInput = document.getElementById('karaoke-videos-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const videoElements = document.querySelectorAll('#karaoke-videos-grid .video-thumbnail');
        
        videoElements.forEach(element => {
            const title = element.querySelector('h4').textContent.toLowerCase();
            const artist = element.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(query) || artist.includes(query)) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    });
}

// Video grid functionality
function initializeVideoGrid() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid || !videoData.videos) return;
    
    videoGrid.innerHTML = '';
    
    videoData.videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-thumbnail';
        videoElement.innerHTML = `
            <div class="video-thumbnail-container">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VmlkZW88L3RleHQ+Cjwvc3ZnPg=='">
                <div class="video-duration">${video.duration || ''}</div>
                <div class="play-overlay">
                    <div class="play-button">▶</div>
                </div>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.artist}</p>
                <span class="video-description">${video.description || ''}</span>
            </div>
        `;
        
        videoElement.addEventListener('click', function() {
            openVideoPlayer(video.videoUrl, video.title);
        });
        
        videoGrid.appendChild(videoElement);
    });
}

// Video player functionality
function initializeVideoPlayer() {
    const modal = document.getElementById('video-player-modal');
    const closeBtn = document.getElementById('close-player');
    const videoPlayer = document.getElementById('main-video-player');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeVideoPlayer);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeVideoPlayer();
            }
        });
    }
    
    // Auto-close when video ends
    if (videoPlayer) {
        videoPlayer.addEventListener('ended', function() {
            closeVideoPlayer();
        });
    }
    
    // Control buttons
    const volumeBtn = document.getElementById('volume-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    if (volumeBtn) {
        volumeBtn.addEventListener('click', function() {
            videoPlayer.muted = !videoPlayer.muted;
            this.textContent = videoPlayer.muted ? '🔇' : '🔊';
        });
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            }
        });
    }
}

function openVideoPlayer(videoUrl, title) {
    const modal = document.getElementById('video-player-modal');
    const videoPlayer = document.getElementById('main-video-player');
    const thumbnailsContainer = document.getElementById('player-thumbnails');
    
    if (modal && videoPlayer) {
        videoPlayer.src = videoUrl;
        modal.classList.add('active');
        
        // Populate thumbnails for easy navigation
        if (thumbnailsContainer && videoData.videos) {
            thumbnailsContainer.innerHTML = '';
            videoData.videos.forEach(video => {
                const thumbElement = document.createElement('div');
                thumbElement.className = 'video-thumbnail';
                thumbElement.innerHTML = `
                    <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTUwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI0NSIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WaWRlbzwvdGV4dD4KPC9zdmc+'">
                    <h4>${video.title}</h4>
                    <p>${video.artist}</p>
                `;
                
                thumbElement.addEventListener('click', function() {
                    videoPlayer.src = video.videoUrl;
                    videoPlayer.load();
                });
                
                thumbnailsContainer.appendChild(thumbElement);
            });
        }
    }
}

function closeVideoPlayer() {
    const modal = document.getElementById('video-player-modal');
    const videoPlayer = document.getElementById('main-video-player');
    
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = '';
    }
}

// Live requests functionality
function initializeLiveRequests() {
    const postButton = document.getElementById('post-request');
    const musicRequestInput = document.getElementById('music-request');
    const requesterNameInput = document.getElementById('requester-name');
    
    if (postButton) {
        postButton.addEventListener('click', function() {
            const musicRequest = musicRequestInput.value.trim();
            const requesterName = requesterNameInput.value.trim() || 'Anonymous';
            
            if (musicRequest) {
                addRequestToServer(musicRequest, requesterName);
                musicRequestInput.value = '';
                requesterNameInput.value = '';
            }
        });
    }
    
    // Allow posting with Enter key
    if (musicRequestInput) {
        musicRequestInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                postButton.click();
            }
        });
    }
    
    // Auto-refresh requests every 30 seconds
    setInterval(function() {
        if (currentPage === 'live-request') {
            loadRequestsFromServer();
        }
    }, 30000);
}

async function addRequestToServer(musicRequest, requesterName) {
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                music: musicRequest,
                name: requesterName
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Refresh the requests list
            loadRequestsFromServer();
            console.log('Request added successfully');
        } else {
            console.error('Failed to add request:', result.error);
            // Fallback to local storage
            addRequestLocal(musicRequest, requesterName);
        }
    } catch (error) {
        console.error('Error adding request to server:', error);
        // Fallback to local storage
        addRequestLocal(musicRequest, requesterName);
    }
}

async function loadRequestsFromServer() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/requests`, {
            ...fetchOptions,
            method: 'GET'
        });
        const result = await response.json();
        
        if (result.success) {
            requests = result.requests;
            refreshRequestsList();
        } else {
            console.error('Failed to load requests:', result.error);
            // Fallback to local storage
            loadRequestsFromStorage();
        }
    } catch (error) {
        console.error('Error loading requests from server:', error);
        // Fallback to local storage
        loadRequestsFromStorage();
    }
}

function addRequestLocal(musicRequest, requesterName) {
    const request = {
        id: Date.now(),
        music: musicRequest,
        name: requesterName,
        timestamp: new Date(),
        number: requests.length + 1
    };
    
    requests.unshift(request); // Add to beginning of array
    saveRequestsToStorage();
    refreshRequestsList();
    
    console.log('Request added locally:', request);
}

function refreshRequestsList() {
    const requestsList = document.getElementById('requests-list');
    if (!requestsList) return;
    
    requestsList.innerHTML = '';
    
    // Sort requests by timestamp (newest first)
    const sortedRequests = [...requests].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    sortedRequests.forEach((request, index) => {
        const requestElement = document.createElement('div');
        requestElement.className = 'request-item';
        requestElement.dataset.id = request._id || request.id; // Support both server and local IDs
        
        // Calculate time remaining (24 hours from creation)
        const createdAt = new Date(request.timestamp);
        const expiresAt = new Date(createdAt.getTime() + (24 * 60 * 60 * 1000));
        const timeRemaining = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60)); // Hours remaining
        
        requestElement.innerHTML = `
            <div class="request-number">${index + 1}</div>
            <div class="request-details">
                <div class="request-music">${request.music}</div>
                <div class="request-meta">
                    <span class="requester-name">${request.name}</span>
                    <span class="request-time">${getTimeAgo(request.timestamp)}</span>
                    <span class="time-remaining">Expires in ~${timeRemaining}h</span>
                </div>
            </div>
        `;
        
        // Add long-press event for deletion
        setupLongPress(requestElement);
        requestsList.appendChild(requestElement);
    });
}

// Long press functionality for request deletion
function setupLongPress(element) {
    let pressTimer;
    const pressDuration = 5000; // 5 seconds
    
    const startPress = (e) => {
        // Prevent context menu on long press
        e.preventDefault();
        
        // Only start timer if not already started
        if (pressTimer) return;
        
        pressTimer = setTimeout(() => {
            // Show confirmation
            if (confirm('Delete this request?')) {
                const requestId = element.dataset.id;
                deleteRequest(requestId);
            }
            pressTimer = null;
        }, pressDuration);
        
        // Add visual feedback
        element.classList.add('pressing');
    };
    
    const endPress = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        element.classList.remove('pressing');
    };
    
    // Add event listeners
    element.addEventListener('mousedown', startPress);
    element.addEventListener('touchstart', startPress);
    element.addEventListener('mouseup', endPress);
    element.addEventListener('mouseleave', endPress);
    element.addEventListener('touchend', endPress);
    element.addEventListener('touchcancel', endPress);
    
    // Prevent context menu on long press
    element.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Delete a request from the server
async function deleteRequest(requestId) {
    if (!requestId) return;
    
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/requests/${requestId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Remove from local state and refresh
            requests = requests.filter(req => (req._id || req.id) !== requestId);
            refreshRequestsList();
            saveRequestsToStorage();
        } else {
            console.error('Failed to delete request:', result.error);
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        // Fallback to local deletion if server fails
        requests = requests.filter(req => (req._id || req.id) !== requestId);
        refreshRequestsList();
        saveRequestsToStorage();
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return 'Just now';
    }
}

function saveRequestsToStorage() {
    localStorage.setItem('nodayRequests', JSON.stringify(requests));
}

function loadRequestsFromStorage() {
    const stored = localStorage.getItem('nodayRequests');
    if (stored) {
        requests = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        requests.forEach(request => {
            request.timestamp = new Date(request.timestamp);
        });
    }
}

function startRequestCleanup() {
    // Clean up requests older than 12 hours every minute
    setInterval(function() {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const originalLength = requests.length;
        
        requests = requests.filter(request => new Date(request.timestamp) > twelveHoursAgo);
        
        if (requests.length !== originalLength) {
            saveRequestsToStorage();
            if (currentPage === 'live-request') {
                refreshRequestsList();
            }
        }
    }, 60000); // Check every minute
}

// Search functionality
function initializeSearch() {
    const karaokeSearch = document.getElementById('karaoke-search');
    const djSearch = document.getElementById('dj-search');
    
    if (karaokeSearch) {
        karaokeSearch.addEventListener('input', function() {
            filterSongs(this.value, 'karaoke');
        });
    }
    
    if (djSearch) {
        djSearch.addEventListener('input', function() {
            filterSongs(this.value, 'dj');
        });
    }
}

function filterSongs(searchTerm, type) {
    const songsContainer = document.getElementById(type === 'karaoke' ? 'karaoke-songs-list' : 'dj-songs-list');
    if (!songsContainer) return;
    
    const songItems = songsContainer.querySelectorAll('.song-item');
    
    songItems.forEach(item => {
        const songText = item.textContent.toLowerCase();
        const matches = songText.includes(searchTerm.toLowerCase());
        item.style.display = matches ? 'block' : 'none';
    });
}

// Utility functions
function createPlaceholderImage(width, height, text) {
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" fill="#333"/>
            <text x="${width/2}" y="${height/2}" fill="white" text-anchor="middle" dy=".3em">${text}</text>
        </svg>
    `)}`;
}

