function openGenre(genre) {
    const genreContent = document.getElementById('genre-content');
    const genreTitle = document.getElementById('genre-title');
    const loading = document.getElementById('loading');
    const musicList = document.getElementById('music-list');
  
    // Set genre title and show loading animation
    genreTitle.textContent = "Genre: " + genre.charAt(0).toUpperCase() + genre.slice(1);
    loading.classList.remove('hidden');
    musicList.innerHTML = ""; // Clear previous list
  
    // Show the content section
    genreContent.classList.remove('hidden');
  
    // Sample data for each genre
    const musicData = {
      hiphop: ["Track 1 - Hip Hop", "Track 2 - Hip Hop", "Track 3 - Hip Hop"],
      rnb: ["Track 1 - R&B", "Track 2 - R&B", "Track 3 - R&B"],
      soul: ["Track 1 - Soul", "Track 2 - Soul", "Track 3 - Soul"]
    };
  
    // Simulate loading delay
    setTimeout(() => {
      loading.classList.add('hidden');
      const tracks = musicData[genre] || [];
      tracks.forEach(track => {
        const li = document.createElement('li');
        li.textContent = track;
        li.onclick = () => playAudioOrVideo(track); // Assign clickable function to play media
        musicList.appendChild(li);
      });
    }, 1000); // 1-second delay for loading animation
  }
  
  function playAudioOrVideo(track) {
    alert("Playing " + track);
    // Code to load and play the actual audio or video can be added here
  }
  
  function toggleFullScreen() {
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer.requestFullscreen) {
      videoPlayer.requestFullscreen();
    } else if (videoPlayer.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  
  function closePlayer() {
    const videoPlayer = document.getElementById('video-player');
    const audioPlayer = document.getElementById('audio-player');
    videoPlayer.classList.add('hidden');
    audioPlayer.classList.add('hidden');
  }
  