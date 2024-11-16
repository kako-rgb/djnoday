// Data for categories and items
const categoryData = {
  arabic: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    chinese: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    dancehall: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    eastAfrican: [
    "A Woman In Love ~ Vivian ", 
    "LAfrica ~ Sauti Sol & Yemi Alade",
    "African Woman ~ Lenny & Kungru",
    "Amina  ~ Sanaipei Tande",
    "Aminia (Lyrics) ~ Nyashinski",
    "A Woman In Love ~ Vivian ",
    "Amuka Kumekucha ~ Maroon Commandos",
    "Baadaye ~ Amos & Josh ft King Kaka", 
    "Baadaye ~ Ommy Dimpoz",
    "Baby Love ~ Otile Brown ",
    "Bad Boy ~ Amani ft. Nyashinski",
    "Bambika ~ Tyrical ft. Lyrical Erico & Shanky Radics", 
    "Bebi Bebi ~ Atemi",
    "Bebi Bebi ~ Nyashinski", 
    "Bembeleza ~ Marlow", 
    "Bidii Yangu ~ Jua Kali "],

 international: ["1, 2 Step ~ Ciara Ft. Missy Elliott ",
"2 In The Morning ~ New Kids On The ",
"6, 8, 12 ~ Brian McKnight ",   
"7 Days ~ Craig David",     
"7 Rings ~ Ariana Grande",       
"7 Years ~ Lukas Graham ",        
"9 To 5 ~ Dolly Parton ",     
"18 Till I Die ~ Brian Adams",       
"21 Guns ~ Green Day",           
"21 Questions ~ 50 Cents & NateDogg",    
"24-7 ~ Kevon Edmunds",        
"24K Magic ~ Bruno Mars",   
"911 ~ Wyclef Jean & Mary J. Blige",   
"2002 ( Inst.) ~ Anne Marie",         
"2002 ~  Anne-Marie",            
"A B C  ~ The Jackson 5",           
"A Drop In The Ocean ~ Ron Pope",       
"A Hard Day's Night ~ The Beatles",        
"A Long December ~ Counting Crows",   
"A Man Without Love ~ Englebert Humperdinck",    
"A Million Dreams ~ The Greatest Showman",      
"A Moment Like This ~ Kelly Clarkson",    
"A Natural Woman (You Make Me Feel Like) ~ Aretha Franklin"   
    ],
    gospel: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    lingala: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    roots: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    traditional: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    naija: [ "Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
    xmass: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
};

// Function to render item list based on category
function displayItems(category) {
  const itemList = document.getElementById("item-list");
  const title = document.getElementById("details-title");

  // Clear previous items
  itemList.innerHTML = "";

  // Update title
  title.textContent = category ? `songs in ${category}` : "Select a Category";

  // Add new items
  if (categoryData[category]) {
    categoryData[category].forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      itemList.appendChild(listItem);
    });
  }
}

// Event listener for category clicks
document.getElementById("category-list").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const selectedCategory = e.target.getAttribute("data-category");
    displayItems(selectedCategory);
  }
});

// Default view
displayItems();

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

//go back code
function goBack() {
  if (genreHistory.length > 0) {
    genreHistory.pop(); // Remove the last genre from history
    if (genreHistory.length === 0) {
      // Show the home section
      document.getElementById('genres-section').classList.remove('hidden');
      document.getElementById('genre-content').classList.add('hidden');
      document.getElementById('back-button').classList.add('hidden');
    } else {
      openGenre(genreHistory[genreHistory.length - 1]); // Open the previous genre
    }
  } else {
    // Navigate to the previous page if no genre history
    window.history.back();
  }
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
