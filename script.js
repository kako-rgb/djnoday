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

  // Sample media paths for each genre
  const mediaData = {
    karaoke: [
      "./resouces/karaoke/video1.mp4",
      "./resouces/karaoke/video2.mp4",
      "./resouces/karaoke/audio1.mp3"
    ],
    mixxez: [
      "./resouces/videos/1.mp4",
      "./resouces/videos/2.mp4",
      "./resouces/videos/audio1.mp3"
    ],
    live: ["LIVE BROADCAST: Stream from a phone or camera coming soon!"]
  };

  // Simulate loading delay
  setTimeout(() => {
    loading.classList.add('hidden');
    const tracks = mediaData[genre] || [];
    tracks.forEach(track => {
      const li = document.createElement('li');
      li.textContent = track.includes("LIVE BROADCAST") ? track : track.split('/').pop();
      li.onclick = () => playAudioOrVideo(track); // Assign clickable function to play media
      musicList.appendChild(li);
    });
  }, 1000); // 1-second delay for loading animation
}

function playAudioOrVideo(track) {
  const mediaPlayer = document.getElementById('media-player');
  const videoPlayer = document.getElementById('video-player');
  const audioPlayer = document.getElementById('audio-player');

  // Reset player sources and visibility
  videoPlayer.src = "";
  audioPlayer.src = "";
  videoPlayer.classList.add('hidden');
  audioPlayer.classList.add('hidden');

  mediaPlayer.classList.remove('hidden'); // Show media player

  // Check the file extension and assign the media to the correct player
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
}

function toggleFullScreen() {
  const videoPlayer = document.getElementById('video-player');
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (videoPlayer.requestFullscreen) {
    videoPlayer.requestFullscreen();
  }
}

function closePlayer() {
  const videoPlayer = document.getElementById('video-player');
  const audioPlayer = document.getElementById('audio-player');
  videoPlayer.classList.add('hidden');
  audioPlayer.classList.add('hidden');
  videoPlayer.pause();
  audioPlayer.pause();
}
