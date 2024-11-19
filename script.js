/////////////////////////////////////////////live request
document.getElementById("liveRequestBtn").addEventListener("click", () => {
  document.getElementById("liveRequestBtn").classList.add("hidden");
  document.getElementById("kcont").classList.add("hidden");
  document.getElementById("mixcont").classList.add("hidden");
  document.getElementById("qr").classList.add("hidden");
  document.getElementById("requestBox").classList.remove("hidden");
});

const requestForm = document.getElementById("requestForm");
const requestsDisplay = document.getElementById("requestsDisplay");
let requestCounter = 0;
let requestData = JSON.parse(localStorage.getItem("requests")) || [];

// Function to render requests
function renderRequests() {
  requestsDisplay.innerHTML = ""; // Clear existing requests
  const now = new Date().getTime();

  requestData = requestData.filter((request) => {
    if (now - request.timestamp < 12 * 60 * 60 * 1000) {
      const requestItem = document.createElement("div");
      requestItem.className = "request-item";
      requestItem.id = `request-${request.id}`;
      requestItem.innerHTML = `
        <span>${request.id}. ${request.name || "User"}</span>
        ${request.request}
      `;
      requestsDisplay.appendChild(requestItem);
      return true;
    }
    return false; // Remove expired requests
  });

  localStorage.setItem("requests", JSON.stringify(requestData));
}

// Load requests on page load
renderRequests();

requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const musicRequest = document.getElementById("musicRequest").value.trim();
  const userName = document.getElementById("userName").value.trim() || "User";

  const requestId = ++requestCounter;

  const requestItem = {
    id: requestId,
    request: musicRequest,
    name: userName,
    timestamp: new Date().getTime(),
  };

  requestData.push(requestItem);

  renderRequests(); // Re-render requests
  localStorage.setItem("requests", JSON.stringify(requestData)); // Save to localStorage

  document.getElementById("musicRequest").value = "";
  document.getElementById("userName").value = "";
});

// Periodically check and remove expired requests
setInterval(() => {
  renderRequests();
}, 60 * 1000); // Check every minute

// Data for categories and items
const categoryData = {
  arabic: [
  "Sample 1",
  "Sample 2",
  "Sample 3",
  "Sample 4",
  "Sample 5"
      ],
      
    chinese: [
    "Because Of Lov ~ Yin Wei Ai Qing-因为爱情 - 伴奏 KTV  pinyin ", 
    "Jin Sheng Yuan ~ ( 今生缘 )",
    "Ni Wen Wo Ai Ni (Lyrics) ~ Teresa Teng",
    "Peng You (朋友) ~ Wakin Chau",
    " 因为爱情 Yin Wei Ai Qing Karena Cinta – 陈奕迅 Eason Chan & 王菲 Faye Wong -Lirik terjemahan ID",
     "Somewhere Over The Rainbow (Lyrics) ~ Israel Kamakawiwoole & Tradução "
        ],

    dancehall: [
      "Sample 1", 
      "Sample 2", 
      "Sample 3", 
      "Sample 4", 
      "Sample 5"],

    eastAfrican: [
      "2 In 1 ~ Naiboi ",
      "A Woman In Love ~ Vivian ",
      " Africa ~ Sauti Sol & Yemi Alade",
      "African Woman ~ Lenny & Kungru ",
      "Afrikan Star (Lyrics) ~ Sauti Sol  ft. Burna Boy ",
      "Amina  ~ Sanaipei Tande ",
      "Aminia (Lyrics) ~ Nyashinski  ",
      "Amuka Kumekucha ~ Maroon Commandos ",
      "Baadaye ~ Amos & Josh ft King Kaka ",
      "Baadaye ~ Ommy Dimpoz ",
      "Baby Love ~ Otile Brown ",
      "Bad Boy ~ Amani ft. Nyashinski  ",
      "Bambika ~ Tyrical ft. Lyrical Erico & Shanky Radics ",
      "Bebi Bebi ~ Atemi ",
      "Bebi Bebi ~ Nyashinski ",
      "Bembeleza ~ Marlow ",
      "Bidii Yangu ~ Jua Kali ",
      "Binti Kiziwi ~ Z. Anto  ",
      "Bless My Room (Lyrics) ~ Necessary Noice  ",
      "Blue Uniform ~ Sauti Sol    ",
      "Bonoko ~ Bonokode ",
      "Boomba Train  ~ E-Sir ft. Nameless   ",
      "Chaguo la Moyo ~ Otile Brown ft Sanaipei Tande  ",
      "Chokoza ~ Avril ft. Marya  ",
      "Chuki ~ Wyre  ",
      "Come Back To Me ~ Tatu ft. Ulopa ",
      "Coming Home ~ Nameless ",
      "Coming Home ~ Sauti Sol ",
      "Crazy Over You ~ K-Lynn ",
      "Daima Kenya ~ Eric Wainaina ",
      "Deadly ~ Nameless ",
      "Dusuma ~ Otile Brown x Meddy ",
      "Fall (Lyrics) ~ Platform ft. Marioo ",
      "Feel My Love ~ Sauti Sol  ",
      "Forget You ~ Bensoul   ",
      "Free ~ Nyashinski   ",
      "Friendzone (Lyrics) ~ Sauti Sol ",
      "Gold Digger ~ Jackie Chandiru ",
      "Haba Haba ~ STL ",
      "Haiya ~ Harry Kimani ",
      "Hakuna Matata ~ Swahili Nation   ",
      "Hallo Hallo ~ Wakimbizi ",
      "Hamnitishi ~ E-Sir ",
      "Hapa Kule ~ P-Unit ft. Nonini   ",
      "Harambee Harambee ~ Daudi Kabaka ",
      "Haturudi Nyuma ~ Kidum ft. Juliana Kanyamozi ",
      "Hayawani ~ Nyashinski ",
      "Helule Helule ~ Daudi Kabaka   ",
      "Hey Baby ~ Marya ft. Collonel Mustafa ",
      "Hi  ~ Otile Brown ",
      "Hoi ~ Wakilisha ",
      "Inauma ~ Bien ",
      "Iokote ~ Maua Sama X Hanstone ",
      "Isabella ~ Sauti Sol   ",
      "Jambo Bwana (Hakuna Matata) ~ Safari Sounds ",
      "Jana Usiku ~ Elani    ",
      "Juju ~ Nameless ft Lenny ",
      "Kamua Leo (Rmx) ~ Kidis, DNA, Wyre, Amileena ",
      "Kamwambie (Lyrics) ~ Diamond Platnumz    ",
      "Kare ~ P-Unit ",
      "Kariobangi South ~ Abbas Kubaf ",
      "Karubandika ~ Kasolo Kyanga ",
      "Kenya Taifa Letu ~ Kenya Police Band  ",
      "Kenyan Boy Kenyan Girl ~ Neccessary Noize ",
      "Kesho ~ Diamond ",
      "Kigeugeu ~ Jaguar   ",
      "Kipepeo ~ Jaguar ",
      "Kitenge (Lyrics) ~ Nviiri The Storyteller  ",
      "Koo Koo ~ Elani ",
      "Kuliko Jana ~ Sauti Sol ",
      "Kwangwaru ~ Harmonize  ft. Diamond Platnumz ",
      "Landlord ~ Major ",
      "Lazizi ~ Sauti Sol  ",
      "Leo ~ Lenny  ",
      "Leo Ni Leo ~ E-Sir ",
      "Liar ~ Wahu ",
      "Lifestyle (Lyrics) ~ Bien ft. Scar Mkadinali   ",
      "Little Star ~ Ousman ",
      "Mac Muga ~ Alikiba ",
      "Magnetic ~ Radio & Weasel ",
      "Maisha ~ E-Sir & Nameless ",
      "Majitu ~ Nameless ",
      "Malaika ~ Nyashinski ",
      "Malaika ~ Safari Sounds ",
      "Mama ~ Avril    ",
      "Mapenzi ~ Kidum ",
      "Mapenzi Yanarun Dunia ~ Alikiba ",
      "Mapoz ~ Diamond ft. Mr. Blue & Jay Melody ",
      "Matapeli ~ Jaguar   ",
      "Mbwe Mbwe ~ Bien ft. Aaron Rimbui  ",
      "Mfalme Wa Mapenzi ~ Sanaipei ",
      "Midnight Train ~ Sauti Sol ",
      "Mikasi ~ Ngwair  ",
      "Milele ~ Elani  - (Lyrics)  ",
      "Missing My Baby ~ Amani ",
      "Money Lover ~ Sauti Sol ",
      "Moss Moss ~ E-Sir & Brenda ",
      "Moto Moto ~ Ray C ft. French Boy ",
      "Mulika Mwizi ~ Kidum ft Sanaipei Tande  ",
      "Mume Bwege ~ Bushoke ",
      "Mungu Pekee ~ Nyashinski  ",
      "Muziki  ~ Darassa ft. Ben Pol ",
      "Mwanza ~ Rayvanny Ft Diamond Platnumz  ",
      "Na Bado ~ H-Art The Band ft. Nyashinki   ",
      "Nadekezwa ~ Mbosso  ",
      "Nairobi ~  Bensoul, Sauti Sol & Nviiri The Storyteller ",
      "Najuta ~ Sanaipei Tande ",
      "Nakufa ~ Okello Max ft. Bensoul & Amlyoto ",
      "Nakupenda ~ Jay Melody ",
      "Naogopa ~ Marioo & Harmonize   ",
      "Naogopa ~ Rayvanny  ",
      "Naskia Utam ~ Bugz    ",
      "Nataka Kulewa ~ Diamond    ",
      "Navutishwa ~ Bensoul X Bien   -  (Lyrics)  ",
      "Nenda Lote ~ Sauti Sol    ",
      "Nikiwa Ndani ~ Prince Adio        ",
      "Niko Poa ~ Mejja       ",
      "Niko Sawa ~ Nviiri The Storyteller ft Bien    ",
      "Nikuskize ~ Jaguar        ",
      "Nimejaribu ~ Elani    ",
      "Ninanoki ~ Nameless     ",
      "Nipepee ~ Mbosso    ",
      "Nishike ~ Sauti Sol       ",
      "Niwe Wako ~ Nikki       ",
      "Now You Know ~ Nyashinski     ",
      "Ntala Nawe ~ Ben Pol ft. Cedo   -  (Lyrics)    ",
      "Ntala Nawe ~ Bensoul  -    (Lyrics)    ",
      "Number Moja ~ Kidum     ",
      "Number One ~ Diamond       ",
      "Ocha ~ Qtac ft. Alahola      ",
      "One Call ~ Otile Brown x Ruby   ",
      "Over My Ex ~ Mejja      ",
      "Overdose ~ Nviiri    ",
      "Perfect Design ~ Nyashinski   ",
      "Pii Pii ~ Marlow    ",
      "Pole Musa ~ Daudi Kabaka   ",
      "Queen ~ Longombas       ",
      "Raha ~ Zuchu      ",
      "Rhumba ~ Wanavokali   ",
      "Rhumba Japani (Lyrics) ~ Sauti Sol ft. Sol Generation  ",
      "Ritwa Riaku ~ Eric Wainaina    ",
      "Riziki ~ Jamnazi     ",
      "Running Low ~ Wahu     ",
      "Salary ~ Nameless     ",
      "Samboira  ~  Ben Pol     ",
      "Sea  ~ Papi Kocha & Nguza    ",
      "Sema Milele (Lyrics) ~ Gilad    ",
      "Set It ~ Dyana Cods ft. Ajay     ",
      "Shauri Yako ~ Ochestra Super Mazembe      ",
      "Si Lazima ~ P-Unit       ",
      "Si Uliniambia ~ MB Dog     ",
      "Sigalame ~ Issa Juma      ",
      "Sina Makosa ~ Fadhili Williams        ",
      "Sinzia ~ Nameless     ",
      "Skamares ~ Madtraxx      ",
      "Sober ~ Sauti Sol      ",
      "Soma Kijana ~ Sauti Sol      ",
      "Stella Wangu ~ Freshly Mwamburi     ",
     "Still The One ~ Sauti Sol      ",
      "Sunshine ~ Nameless ft. Habida      ",
      "Sura Yako ~ Sauti Sol       ",
      "Suzanna ~ Sauti Sol     ",
      "Sweet Love ~ Wahu     ",
      "Taboo (Taabu) ~ Phy  -  (Lyrics)  ",
      "Tausi Ndege Wangu ~ Fundi Konde       ",
      "Tawala Kenya Tawala ~ Mwalimu Thomas Wesonga    ",
      "Taxi Driver ~ Daudi Kabaka       ",
      "Telenovela (Inst.) ~ Cedo ft. Kidum  -  (Lyrics)   ",
      "Tesso ~ Tatuu       ",
      "Tetema ~ Rayvanny ft. Diamond Platinumz    ",
      "Tokelezea ~ Abbas ft. Chantelle      ",
      "Tonight ~ Amani         ",
      "True Love (Lyrics) ~ Bien True Love   ",
      "Tuachane ~ Lava Lava    ",
      "Tuendelee ~ KleptoManiax   ",
      "Tujiangalie ~ Sauti Sol ft. Nyashinski     ",
      "Unbwogable ~ Gidi Gidi & Maji Maji       ",
      "Usiende Mbali ~ Juliana Kanyomozi  ft. Bushoke      ",
      "Usiniseme ~ AliKiba       ",
      "Utawala ~ Juliani       ",
      "Utazoea ~ Nyashinski   -  (Lyrics)          ",
      "Uvivu Mbaya ~ Maroon Commandos     ",
      "Vaileti ~ Matonya     ",
      "Valu Valu ~ Chameleon      ",
      "Vile Naskia ~ Jua Kali ft. Q-Tasi      ",
      "Wangu ~ Nadia Mukami ft. Sanaipei Tande  ",
      "Wasiwasi ~ Rayvanny    -  (Lyrics)        ",         
      "Wasiwasi ~ Rayvanny       ",
      "Wee Kamu ~ Nonini        ",
      "Woman ~ Otile Brown X Harmonize       ",
      "You Guy ~ P-Unit ft. Collo     "
    ],

international: [
"1, 2 Step ~ Ciara Ft. Missy Elliott ",
"2 In The Morning ~ New Kids On The ",
"6, 8, 12 ~ Brian McKnight ",   
" 7 Days ~ Craig David",     
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
    gospel: [
      "11th Hour ~ Betty Bayo ",
      "A No Me Dat ~ Richie Spice",
      "Again ~ Kambua      ",
      "Ahadi Zake ~ Marion Shako        ",
      "Amazing Grace ~ (Praise & Worship)    ",
      "Amen ~ Yovi ft. Lil Kesh & Mayorkun     ",
      "Appointment ~ Jimmy Gait      ",
      "Asante ~ Chomba         ",
      "At The Cross ~   (Gospel)       ",
      "Backslide ~ Danco      ",
      "Blessed Assurance ~ (Praise & Worship)     ",
      "Bwana Asema ~ Jemimah Thiongo      ",
      "Chant A Prayer ~ Rufftone      ",
      "Daktari ~ Esther Wahome     ",
      "Everything (Amen) ~ Timi Dakolo   ",
      "Father Abraham ~        ",
      "Follow You ~ Gloria Muliro      ",
      "Fundi Wa Mbao ~ Gospel Fathers      ",
      "God Be With You Till We Meet Again ",
      "Goodness of God (Reggae Rmx) ~ CeCe Winans  - (Lyrics)",    
      "Goodness of God ~ CeCe Winans",          
      "Hallelujah ~ Alexandra Burke",     
      "Hallelujah ~ Pentatonix",        
      "Heaven ~ Emeli Sande",       
      "Hela ~ Juliani",       
      "He's Got The World In His Hands ",            
      "Holiday ~ Hopekid & Altarmin",      
      "Holy, Holy, Holy ",          
      "Hosanna ~ Everlyn Wanjiru",       
      "How Great Thou Art ",    
      "Huratiti ~ Jimmy Gait ",       
      "I Know Who I Am ~ Sinach",     
      "I Need Thee Every Hour  ",             
      "Imela ~ Nathaniel Bassey ft. Enitan Adaba",      
      "Jesus Never Fails ~ Patrick Oyaro",       
      "Katikia Yesu ~ Kris",          
      "Kazi Ni Kazi ~ Ringtone",       
      "Kiriro ~ Daddy Owen, Alan Aaron & Kerah",         
      "Kum Ba Yah, My Lord ",               
      "Kuna Dawa ~ Esther Wahome",        
      "Kwetu Pazuri ~ Ambasadors Of Christ ",     
      "Lingala Ya Yesu ~ Pitson",       
      "Live For You ~ BMF",      
      "Mateke ~ Linet (Size-8)",       
      "Mbona ~ Daddy Owen ft Deno ",    
      "Mpango Wa Kando ~ Gloria Muliro",    
      "Mpenzi ~ Willy Paul",       
      "Muheani ~ Phyllis Mbuthia & Sammy Irungu",    
      "Mungu Baba ~ Ruffton ft. The Kenya G.S.U.",       
      "Mwachie Mungu ~ Gabriel Mwamuye ft. Nyota Ndogo",       
      "Mwamba ~ Maximum Melodies",     
      "Mwanake ~ Benachi ft. Kaberere",     
      "Mwema ~ Mercy Masika",          
      "Mwenye Baraka (Akisema Atakubariki) ~ Jemmimah Thiongo",      
      "Naduor ~ Christina Shusho",      
      "Nakutazamia ~ Mercy Wairegi",      
      "Napokea Kwako  ~ Christina Shusho & Janet Otieno",      
      "Natamani ~ Eunice Njeri ft. Kaberere",     
      "Ngai Murathimi ~ Ruth Wamuyu",     
      "Nibebe ~ Rose Muhando",       
      "Nifunike ~ Mercy Wairegi",     
      "Nikupendeze ~ Mercy Masika",     
      "Nimekubali ~ Eunice Njeri",       
      "Nipe Macho ~ Christina Shusho",     
      "Nisikie ~ Kambua",     
      "Njoo Ufanyiwe Maombi ~ Bony Mwaitege",    
      "Ombea Adui Yako ~ Peace Mulu",     
      "One Of Us ~ Joan Osborne",     
      "Pamela ~ Ringtone ft. SK Blue",        
      "Penzi Lako ~ Krystal",     
      "Racing Up ~ Paul Mwai ",    
      "Rock Of Ages ~  (Gospel) ",         
      "Sala Zangu ~ Ilagosa Wa Ilagosa",   
      "Saluti ~ Daddy Owen & Friends ",    
      "Sari Sari ~ D.K. Kwenye Beat ft Anto Neosoul",     
      "Shackles (Praise You) ~ Mary Mary",    
      "Shusha Nyavu ~ Christina Shusho",        
      "Sitarudi Kuwa Vile ~ Hellena Ken",        
      "Sitolia ~ Gloria Muliro & Willy Paul ",       
      "Siyabonga ~ Betty Bayo",     
      "Stomp ~ God's Property (Kirk Franklin)",    
      "Sweet By and By  ~ (Gospel)",     
      "Take My Hand Precious Lord ~ Elvis Presley",      
      "Taunet Nelel ~ Emmy Kosgey",     
      "Tenda Wema ~ Ringtone & Christina Shusho",  
      "Thamani Ya Wokuvu Wangu ~ Christina Shusho",     
      "Trust & Obey ~ (Gospel) ",     
      "Uliniumba Nikuabudu ~ Angela Chibalonza ",      
      "Umeniweza ~ Eunice Njeri",       
      "Umetenda Mema ~ Kambua",     
      "Uninyunyizie Maji (Karaoke) ~ Our Lady Of Fatima Kongowea Catholic Choir",    
      "Upendo Ule Ule ~ Alice Kamande",     
      "Uwezo ~ Adawnage",      
      "Wanajua ~ Mwenye Haki & Pitson",      
      "Wangu ~ Bahati ft. Mr. Seed",       
      "Watu Wote ~ Kambua",      
      "Waweza ~ Everlyn Wanjiru",     
      "Wewe Pekee ~ Alice Kamande ",     
      "What a Friend We Have In Jesus ",      
      "When The Saints Go Matching In ",     
      "Wi Muthaka ~ Ruth Wamuyu",        
      "Wi Mutheru ~ Anastacia Karanja",       
      "Yale Umenitendea ~ Pastor Peace Mulu",       
      "You Know Me ~ Danson Mutheka",      
      "You Never Know ~ Willy Paul "    
     ],
    lingala: [
    "Sample 1", 
    "Sample 2", 
    "Sample 3",
    "Sample 4", 
    "Sample 5"
  ],

    roots: [
    "Sample 1", 
    "Sample 2", 
    "Sample 3", 
    "Sample 4",
    "Sample 5"
    ],

    traditional: [
    "Sample 1",
    "Sample 2", 
    "Sample 3", 
    "Sample 4", 
    "Sample 5"
  ],

    naija: [ 
    "Sample 1",
    "Sample 2",
    "Sample 3",
    "Sample 4",
    "Sample 5"
  ],

    xmass: [
   "Sample 1", 
   "Sample 2", 
   "Sample 3", 
   "Sample 4", 
   "Sample 5"
  ],

};
    // Select the elements
    const kcont = document.getElementById('kcont');
    const mixcont = document.getElementById('mixcont');
    const liveRequestBtn = document.getElementById('liveRequestBtn');
    const qr = document.getElementById('qr');
    const genresSection = document.getElementById('genres-section');
    const kvidz = document.getElementById('kvidz');
    const kvidz2 = document.getElementById('kvidz2');
    const container1 = document.getElementById('container1');

        kcont.addEventListener('click', () => {
      // Hide the kcont div
      kcont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      // Show the genres section
      genresSection.style.display = 'block';
    });

        mixcont.addEventListener('click', () => {
      // Hide the mix div
      kcont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      // Show the genres section
         
    });

    kcont.addEventListener('click', () => {
      // Hide the live div
      kcont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      // Show the genres section
      kvidz.style.display = 'block';
    });

    kvidz.addEventListener('click', () => {
      // Hide the live div
      kcont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      kvidz.style.display = 'none';
      container1.style.display = 'none';
      // Show the genres section
      kvidz2.style.display = 'block';
    });


 
// Function to render item list based on category
function displayItems(category) {
  const itemList = document.getElementById("item-list");
  const title = document.getElementById("details-title");

  // Clear previous items
  itemList.innerHTML = "";

  // Update title
  //second colum items
  title.textContent = category ? ` ${category}` : "Select a Category";

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
   
  };

  ////////////////////////////////////////////////// Populate media list based on genre///////////////////////////////////////////////////////////////////////////
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
