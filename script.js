let genreHistory = [];

// Open a genre and display its content
function openGenre(genre) {
  const genreContent = document.getElementById('genre-content');
  const genreTitle = document.getElementById('genre-title');
  const musicList = document.getElementById('music-list');
  const genresSection = document.getElementById('genres-section');
  const karaokeLogo = document.querySelector('.karaoke-logo');
  const backButton = document.getElementById('back-button');

  // Update genre title
  genreTitle.textContent = "Genre: " + capitalizeFirstLetter(genre);

  // Clear previous list
  musicList.innerHTML = "";

  // Show genre content and hide genres section
  genreContent.classList.remove('hidden');
  genresSection.classList.add('hidden');
  
  // Show back button
  backButton.classList.remove('hidden');
  
  // Toggle karaoke logo visibility
  if (genre === 'karaoke') {
    karaokeLogo.classList.remove('hidden');
  } else {
    karaokeLogo.classList.add('hidden');
  }

  // Push current genre to history for back navigation
  genreHistory.push(genre);

  // Sample media data for genres
  const mediaData = {
    karaoke: [
      { name: "Song 1", files: ["./resouces/karaoke/video1.mp4", "./resouces/karaoke/audio1.mp3"] },
      { name: "Song 2", files: ["./resouces/karaoke/video2.mp4"] },
      { name: "Song 3", files: ["./resouces/karaoke/audio2.mp3"] }
    ],
    mixxez: [
      "./resouces/videos/1.mp4",
      "./resouces/videos/2.mp4",
      "./resouces/videos/audio1.mp3",
      "./resouces/videos/audio2.mp3"
    ],
    live: [
      "LIVE BROADCAST: Stream coming soon!"
    ]
  };

  // Populate media list based on genre
  const tracks = mediaData[genre] || [];
  tracks.forEach(item => {
    const li = document.createElement('li');
    li.textContent = typeof item === 'string' ? item : item.name;
    li.classList.add('clickable');
    li.onclick = () => playAudioOrVideo(item.files ? item.files[0] : item);
    musicList.appendChild(li);
  });

  // Animate genres section fading out
  genresSection.style.animation = "fadeOut 0.5s forwards";
  
  // Animate genre content fading in
  genreContent.style.animation = "fadeIn 0.5s forwards";
}

// Play selected media (video or audio)
function playAudioOrVideo(track) {
  const mediaPlayer = document.getElementById('media-player');
  const videoPlayer = document.getElementById('video-player');
  const audioPlayer = document.getElementById('audio-player');
  const closeButton = document.getElementById('close-button');

  // Reset player sources and hide both players
  videoPlayer.src = "";
  audioPlayer.src = "";
  videoPlayer.classList.add('hidden');
  audioPlayer.classList.add('hidden');

  // Show media player and close button
  mediaPlayer.classList.remove('hidden');
  closeButton.classList.add('visible');

  // Determine media type and play accordingly
  if (track.endsWith(".mp4")) {
    videoPlayer.src = track;
    videoPlayer.classList.remove('hidden');
    videoPlayer.load();
    videoPlayer.play().catch(error => console.error("Error playing video:", error));
  } else if (track.endsWith(".mp3")) {
    audioPlayer.src = track;
    audioPlayer.classList.remove('hidden');
    audioPlayer.load();
    audioPlayer.play().catch(error => console.error("Error playing audio:", error));
  } else {
    console.log("Unsupported media format:", track);
    alert("This media format is not supported.");
  }

  // Position media player based on screen size
  positionMediaPlayer();
}

// Close the media player
function closePlayer() {
  const mediaPlayer = document.getElementById('media-player');
  const videoPlayer = document.getElementById('video-player');
  const audioPlayer = document.getElementById('audio-player');
  const closeButton = document.getElementById('close-button');

  // Pause and hide media players
  videoPlayer.pause();
  audioPlayer.pause();
  videoPlayer.classList.add('hidden');
  audioPlayer.classList.add('hidden');

  // Hide media player and close button
  mediaPlayer.classList.add('hidden');
  closeButton.classList.remove('visible');
}

// Navigate back to the previous genre or home
function goBack() {
  if (genreHistory.length > 1) {
    // Remove current genre from history
    genreHistory.pop();
    // Get the previous genre
    const previousGenre = genreHistory[genreHistory.length - 1];
    // Open the previous genre
    openGenre(previousGenre);
  } else {
    // If no history, go back to genres section
    const genreContent = document.getElementById('genre-content');
    const genresSection = document.getElementById('genres-section');
    const backButton = document.getElementById('back-button');
    const karaokeLogo = document.querySelector('.karaoke-logo');

    // Hide genre content and back button, show genres section
    genreContent.classList.add('hidden');
    genresSection.classList.remove('hidden');
    backButton.classList.add('hidden');
    karaokeLogo.classList.add('hidden');

    // Reset genre history
    genreHistory = [];
  }
}

// Toggle fullscreen for video player
function toggleFullScreen() {
  const videoPlayer = document.getElementById('video-player');
  if (!document.fullscreenElement) {
    videoPlayer.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Position media player based on screen size
function positionMediaPlayer() {
  const mediaPlayer = document.getElementById('media-player');
  const container = document.querySelector('.container');

  if (window.innerWidth > 768) {
    // Desktop: Position below genre content
    mediaPlayer.style.position = 'absolute';
    mediaPlayer.style.top = '60%';
    mediaPlayer.style.left = '50%';
    mediaPlayer.style.transform = 'translate(-50%, -50%)';
    mediaPlayer.style.width = '50%';
  } else {
    // Mobile: Position below content and QR
    mediaPlayer.style.position = 'relative';
    mediaPlayer.style.top = 'auto';
    mediaPlayer.style.left = 'auto';
    mediaPlayer.style.transform = 'none';
    mediaPlayer.style.width = '90%';
  }
}

// Close player when clicking outside of it
window.onclick = function(event) {
  const mediaPlayer = document.getElementById('media-player');
  if (event.target == mediaPlayer) {
    closePlayer();
  }
}

// Adjust media player position on window resize
window.onresize = function() {
  if (!document.getElementById('media-player').classList.contains('hidden')) {
    positionMediaPlayer();
  }
}
