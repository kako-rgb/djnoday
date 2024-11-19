/////////////////////////////////////////////live request


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
  "(There's Gotta Be) More To Life ~ Stacy Orrico",      
  "1, 2 Step ~ Ciara Ft. Missy Elliott ",
  "2 In The Morning ~ New Kids On The Block",       
  "6, 8, 12 ~ Brian McKnight",      
  "7 Days ~ Craig David",      
  "7 Rings ~ Ariana Grande",        
  "7 Years ~ Lukas Graham ",         
  "9 To 5 ~ Dolly Parton",       
  "18 Till I Die ~ Brian Adams",          
  "21 Guns ~ Green Day",            
  "21 Questions ~ 50 Cents & NateDog",        
  "24-7 ~ Kevon Edmunds",          
  "24K Magic ~ Bruno Mars",     
  "911 ~ Wyclef Jean & Mary J. Blige",   
  "2002 ( Inst.) ~ Anne Marie ",          
  "2002 ~  Anne-Marie",              
  "A B C  ~ The Jackson 5",            
  "A Drop In The Ocean ~ Ron Pope",        
  "A Hard Day's Night ~ The Beatles",         
  "A Long December ~ Counting Crows",     
  "A Man Without Love ~ Englebert Humperdinck",      
  "A Million Dreams ~ The Greatest Showman ",      
  "A Moment Like This ~ Kelly Clarkson ",     
  "A Natural Woman (You Make Me Feel Like) ~ Aretha Franklin",       
  "A New Day Has Come ~ Celine Dion",    
  "A Night To Remember ~ Mary J Blige",     
  "A Sky Full Of Stars ~ Coldplay",      
  "A Song for Mama ~ Boyz II Men",       
  "A Thousand Miles ~ Vanessa Carlton",    
  "A Thousand Years ~ Christina Perri",          
  "A Whole New World ~ Peobo Bryson & Regina Bell",          
  "A Woman's Worth ~ Alicia Keys",       
  "Absolutely (Story Of A Girl) ~ Nine Days",      
  "Addicted ~ Simple Plan",       
  "Adore You ~ Miley Cyrus",       
  "Adorn ~ Miguel",      
  "Adventure Of A Lifetime ~ Coldplay",     
  "Africa ~ Toto",         
  "Again ~ Faith Evans ",     
  "Against All Odds (Take A Look At Me Now) ~ Phil Collins ",      
  "Aïcha ~ Khaled",            
  "Ain't 2 Proud 2 Beg ~ TLC",      
  "Ain't No Sunshine ~ Bill Withers",          
  "Aint Nobody ~ Faith Evans",     
  "Ain't Nobody ~ Rufus & Chaka Khan",           
  "Ain't Thinkin' Bout You ~ Bow Wow ft. Chris Brown",       
  "Alejandro ~ Lady Gaga",     
  "Alice (Who The Fuck Is Alice) ~ Smokie",    
  "All 4 Love ~ Color Me Bad",     
  "All About That Bass ~ Meghan Trainor",    
  "All Cried Out ~ Allure ft. 112",        
  "All I Ask ~ Adele",     
  "All I Ask of You ~ from The Phantom of the Opera ",       
  "All I Ask Of You ~ Phantom Of The Opera",        
  "All I Ever Need Is You ~ Kenny Rogers & Dottie West",   
  "All I Have ~ Jennifer Lopez & LL Cool J ",     
  "All I Have To Do Is Dream ~ Everly Brothers ",    
  "All I Have To Give ~ Backstreet Boys",      
  "All I Wanna Do ~ Sheryl Crow ",    
  "All My Friends ~ Snakehips ft. Tinashe & Chance The Rapper",     
  "All My Life ~ K-Ci & Jojo",     
  "All Night Long (Touch Me) ~ Cathy Dennis",    
  "All Night Long ~ Lionel Richie",    
  "All Of Me ~  John Legend",    
  "All Out of Love ~ Air Supply",   
  "All That She Wants ~ Ace of Base",   
  "All The Man That I Need ~ Whitney Houston",      
  "All The Stars ~ Kendrick Lamar & SZA",   
  "All The Things (Your Man Won't Do) ~ Joe",       
  "All The Things She Said ~ T.A.T.U.",    
  "All Time Low ~ Jon Bellion",  
  "All You Need Is Love ~ The Beatles",     
  "All You Wanted ~ Michelle Branch",  
  "Ally Brooke ~ Low Key ft. Tyga",    
  "Always ~ Atlantic Starr",     
  "Always ~ James Ingram",  
  "Always And Forever ~ Luther Vandross",  
  "Always Be My Baby ~ Mariah Carey",     
  "Always In My Heart ~ Tevin Campbell",   
  "Always Love ~ Lauren Jauregui   -  (Lyrics)",   
  "Always On My Mind ~ Elvis Presley",     
  "Always On Time ~ Ja Rule & Ashanti",    
  "Always Remember Us This Way ~ Lady Gaga",   
  "Am I Wrong ~ Nico & Vinz",
  "Amanda ~ Don Williams",   
  "America ~ Neil Diamond",      
  "American Boy ~ Estelle ft. Kanye West",      
  "American Girls ~ Counting Crows & Sheryl Crow",  
  "American Love ~ Qing Madi ",    
  "American Pie ~ Don McLean",    
  "American Pie ~ Madonna ",  
  "And Our Feelings ~ Babyface ",    
  "Angel ~ Robbie Williams",   
  "Angel ~ Shaggy & Rayvon",   
  "Angel Baby ~ Troye Sivan",    
  "Angel Of Mine ~ Monica",    
  "Animal Song ~ Savage Garden",    
  "Anisa ~  Kingstin & Bedbug ",    
  "Annie's Song ~ John Denver ",  
  "Another day In Paradise ~ Phil Collins ",    
  "Another Sad Love Song ~ Toni Braxton ", 
  "Anyone Who Isn't Me Tonight ~ Kenny Rogers & Dottie West",   
  "Anything ~ 3T ",    
  "Anything ~ Jojo ",      
  "Apologize ~ Timbaland & OneRepublic",      
  "Applause ~ Lady Gaga",    
  "Applejack ~ Dolly Parton ",  
  "Are You Gonna Be My Girl ~ Jet ",    
  "Are You Jimmy Ray ~ Jimmy Ray ",  
  "Are You WIth Me ~ Lost Frequencies",    
  "Area Codes ~ Ludacris & Nate Dogg",  
  "As  ~  George Michael ft. Mary J. Blige",    
  "As I Lay Me Down ~ Sophie B. Hawkins",    
  "As Long As You Love Me ~ Backstreet Boys",    
  "As Long As You Love Me ~ Justin Bieber",        
  "Ascension (Dont Ever Wonder) ~ Maxwell",        
  "Ask Of You ~ Raphael Saadiq",   
  "Astronaut In The Ocean ~ Masked Wolf",         
  "At Your Best (You Are Love) ~ Aaliyah",   
  "Attention ~ Charlie Puth",    
  "Automatic ~ Pointer Sisters",   
  "Ave Maria ~ Beyonce",     
  "Away In A Manger ~ Carrie Underwood  - (Xmas Song)",   
  "Ayo ~ Chris Brown & Tyga",   
  "Baby ~ Brandy ",   
  "Baby Boy ~ Beyonce Knowles & Sean Paul",   
  "Baby Can I Hold You ~ Tracy Chapman",    
  "Baby Hold On Me ~ Gerald Levert & Eddie Levert ",   
  "Baby I Love You (Lyrics) ~ Tiffany Alvord ",   
  "Baby I Love Your Way ~ Big Mountain ",  
  "Baby Love ~ Nicole Scherzinger ft. Will.i.am", 
  "Baby What About You ~ Crystal Gayle",     
  "Baby, Baby ~ Amy Grant",    
  "Baby, Baby, Baby ~ TLC ",  
  "Baby, Come To Me ~ Patti Austin & James Ingram ",  
  "Baby, One More Time ~ Britney Spears ",  
  "Bachelor Boy ~ Cliff Richard ",     
  "Back At One ~ Brian McKnight",  
  "Back For Good ~ Take That",   
  "Back In Time ~ Pitbull",     
  "Back That Thang Up ~ Juvenile ft. Manny Fresh & Lil Wayne",    
  "Back To Life ~ Soul II Soul ",   
  "Bad ~ Michael Jackson ",    
  "Bad Girls ~ Donna Summer ",  
  "Bad Guy ~ Billie Eilish ",   
  "Bad Liar ~ Imagine Dragons",  
  "Bad Romance ~ Lady Gaga",   
  "BadFish ~ Sublime ",   
  "Bailamos ~ Enrique Iglesias",     
  "Ballerina Girl ~ Lionel Ritchie ",  
  "Bang Bang ~ Jessie J, Ariana Grande, Nicki Minaj ",   
  "Bang Bang ~ Will.I.Am ", 
  "Barbie Girl ~ Aqua",   
  "Barely Breathing ~ Duncan Sheik",  
  "Barking ~ Ramz",       
  "Bartender ~ Lady Antebellum  ",   
  "Battlefield ~ Jordin Sparks ",   
  "Be Honest ~ Jorja Smith ft. Burna Boy",    
  "Be Like That ~ 3 Doors Down",   
  "Be My Lover ~ La Bouche",   
  "Be With You ~ Akon ",     
  "Be With You ~ Enrique Iglesias",   
  "Be Without You ~ Mary J. Blige ",      
  "Beat It ~ Michael Jackson",   
  "Beautiful ~ Christina Aguilera",     
  "Beautiful ~ Snoop Dog & Pharrell, Uncle Charlie Wilson",   
  "Beautiful Day ~ U2 ",   
  "Beautiful Girls ~ Sean Kingston ",    
  "Beauty And A Beat ~ Justin Bieber ft. Nicki Minaj ",      
  "Because I Got High ~ Afroman",  
  "Because Of You ~ Kelly Clarkson  ",   
  "Because OF You ~ Ne-Yo",      
  "Because You Loved Me ~ Celine Dion ",  
  "Bed ~ J Holiday ",   
  "Bed Of Roses ~ Bon Joviavi ",  
  "Before I Let You Go ~ Blackstreet",   
  "Before You Walk Out Of My Life ~ Monica ",   
  "Being With You ~ Smokey Robinson ",    
  "Believe ~ Cher",    
  "Believer ~ Imagine Dragons",    
  "Beneath Your Beautiful ~ Labrinth ft. Emell Sande ",     
  "Best Friend ~ Brandy ",   
  "Best Friend ~ Toni Braxton",     
  "Best Part ~ Daniel Caesar ft. H.E.R.",      
  "Best Thing I Never Had ~ Beyonce ",    
  "Better ~ Khalid",      
  "Better Now ~ Post Malone ",   
  "Better Off Alone ~ Alice Deejay ",  
  "Between Me & You ~ Ja Rule & Christina Milian ",   
  "Big Big World ~ Emilia ",  
  "Big Girls Don't Cry (Personal) ~ Fergie",      
  "Big In Japan ~ Alphaville ",    
  "Big Poppa ~ The Notorious B.I.G. ",  
  "Big Things Poppin' ~ T.I.  ",         
  "Billie Jean ~ Michael Jackson",   
  "Billionaire ~ Travie McCoy ft. Bruno Mars ",     
  "Bitch ~ Meredith Brooks",    
  "Bitter Sweet Symphony ~ The Verve ",   
  "Black Beatles ~ Rae Sremmurd  ft. Gucci Mane",   
  "Black Heart ~ Stooshe",       
  "Black Magic ~ Little Mixx ",    
  "Black Velvet ~ Alannah Myles",   
  "Black Widow ~ Iggy Azalea  ft. Rita Ora",    
  "Blame ~ Calvin Harris ft. John Newman ",  
  "Blame It On Me ~ George Ezra",    
  "Blank Space ~ Taylor Swift",   
  "Bleeding Love ~ Leona Lewis ",     
  "Blinding Lights ~ The Weeknd",   
  "Bloodstream ~ Ed Sheeran ft. Rudimental",    
  "Blue (Da Ba Dee) ~ Eiffel 65",  
  "Blue Berry Hill ~ Fats Domino",    
  "Blue Suede Shoes ~ Elvis Presley ",  
  "Blurred Lines ~ Robin Thicke ft. T.I. & Pharrell",    
  "Blurry ~ Puddle Of Mudd ",    
  "Bodak Yellow ~ Cardi B ",  
  "Body & Soul ~ Anita Baker",   
  "Body ~ Loud Luxury ft. Brando",     
  "Bohemian Rhapsody ~ Queen ",      
  "Boo'd Up ~ Ella Mai" ,   
  "Boom Boom Boom ~ Venga Boys",    
  "Boom Clap ~ Charli XCX ",  
  "Bootylicious ~ Destiny's Child",   
  "Born To Be Wild ~ Steppenwolf",     
  "Boulevard Of Broken Dreams ~ Green Day ",  
  "Bow Wow (Thats My Name) ~ Lil Bow Wow ",   
  "Boyfriend ~ Justin Bieber ",   
  "Break Free ~ Ariana Grande  ft. Zedd ",  
  "Break Up With Your Girlfriend, I'm Bored ~ Ariana Grande",  
  "Break Your Heart ~ Taio Cruz ft. Ludacris",   
  "Breakaway ~ Kelly Clarkson  ",   
  "Breakeven ~ The Script ",   
  "Breakfast At Tiffany's ~ Deep Blue Something ",       
  "Breathe ~ Faith Hill ",   
  "Breathe ~ Michelle Branch ",   
  "Breathe Again ~ Tony Braxton",   
  "Breathe Easy ~ Blue ",     
  "Breathin ~ Ariana Grande",    
  "Breathless ~ Shayne Ward ",    
  "Breathless ~ The Corrs ",   
  "Bring It All To Me ~ Blaque & NSYNC",   
  "Broken Hearted ~ Brandy ft. Wanya Morris",    
  "Brown Eyes ~ Destiny's Child ",   
  "Budapest ~ George Ezra ",   
  "Buffalo Stance ~ Neneh Cherry ",    
  "Bump 'N' Grind ~ R. Kelly",    
  "Bump, Bump, Bump ~ B2K & P.Diddy ",   
  "Burn ~ Ellie Goulding ",     
  "Burn ~ Usher ",  
  "Burning Love ~ Dennis Linde ",     
  "Bury A Friend ~ Billie Eilish",  
  "Bust Your Windows ~ Jazmine Sullivan ",    
  "Butterfly Kisses ~ Bob Carlisle ",   
  "Buy Me A Rose ~ Kenny Rogers",   
  "Buy Me A Rose ~ Luther Vandross ",     
  "By Your Side ~ Sade  ",    
  "Bye Bye ~ Mariah Carey  ",   
  "Cake By The Ocean ~ DNCE ",   
  "Califonia Love ~ 2Pac ",  
  "Califonication ~ Red Hot Chili Peppers",    
  "California Gurls ~ Katy Perry ft. Snoop Dogg",    
  "Call Me ~ Spagna",        
  "Call Me May Be ~ Carly Rae Jepsen ",   
  "Call My Name ~ Cheryl ",   
  "Call The Man ~ Celine Dion ",    
  "Can I Stay With You ~ Babyface ",    
  "Can I Touch You..There ~ Michael Bolton",   
  "Can We Talk ~ Tevin Campbell ",   
  "Can You Feel The Love Tonight ~ Elton John ",    
  "Can You Help Me ~ Usher ",   
  "Can You Stand The Rain ~ New Edition ", 
  "Candle In The Wind ~ Elton John ",   
  "Candy ~ Robbie Williams ",     
  "Candy Girl ~ New Edition",    
  "Candy Rain ~ Soul 4 Real",      
  "Candy Shop ~ 50 Cent",   
  "Can't Be With You Tonight ~ Judy Boucher",  
  "Can't Cry Anymore ~ Sheryl Crow",    
  "Can't Get Enough Of Your Love, Babe ~ Barry White",      
  "Can't Get You Out Of My Mind ~ Kylie Minogue",    
  "Can't Help But Wait ~ Trey Songz ",     
  "Can't Help Falling In Love ~ Elvis Presley",   
  "Can't Hold Us ~ Macklemore & Ryan Lewis ft. Ray Dalton ",  
  "Can't Stop The Feeling ~ Justin Timberlake ", 
  "Can't Stop This Thing We Started ~ Bryan Adams ",  
  "Cardboard Box (Rmx) ~ FLO ", 
  "Careless Whisper ~ Wham!",    
  "Caribbean Queen ~ Billy Ocean ",  
  "Casanova ~ Levert",       
  "Case Of The Ex ~ MYA ",     
  "Castle On The Hill ~ Ed Sheeran",
  "Celebration ~ Kool & The Gang",    
  "Certain Things (Lyrics) ~ James Arthur ",       
  "Chained To The Rhythm ~ Katy Perry ft. Skip Marley",    
  "Chandelier ~ Sia ",    
  "Change Clothes ~ Jay-Z  ft. Pharrell Williams",      
  "Change The World ~ Eric Clapton",  
  "Changes ~ 2 Pac ",      
  "Changing ~ Sigma ",   
  "Chasing Payments ~ Adele ",     
  "Chasing The Sun ~ The Wanted ",  
  "Cheap Thrills ~ Sia  ",       
  "Cheerleader ~ Omi ",    
  "Cheers (Drink To That) ~ Rihanna ",   
  "Chiquitita ~ Abba",      
  "Chop My Money ~ P-Square ",      
  "Chun-Li ~ Nicki Minaj ",   
  "Ciao Adios ~ Anne-Marie",  
  "Cigarettes & Alcohol  ~ Oasis",       
  "Cinderella ~ Alikiba ",     
  "Circles ~ Post Malone",    
  "Cleanin Out My Closet ~ Eminem",    
  "Climax ~ Usher",    
  "Clocks ~ Coldplay ",   
  "Close To You ~ Maxi Priest ",    
  "Close To You ~ The Carpenters ",    
  "Closer ~ The Chainsmokers ft. Halsey ",  
  "Clown ~ Emeli Sande ",      
  "Club At The End Of The Street ~ Elton John",    
  "Clumsy ~ Fergie",      
  "Coast 2 Coast (Suavemente) ~ Angie Martinez & Wyclef Jean",    
  "Coat Of Many Colors ~ Dolly Parton",  
  "Cold  ~ Maroon 5 ft. Future",    
  "Cold Rock A Party ~ MC Lyte ft. Missy Elliott",   
  "Cold Shoulder ~ Adele ",     
  "Cold Water ~ Major Lazer ft. Justin Bieber & MØ ",   
  "Colors Of The Wind ~ Vanessa Williams     ",
  "Come & Get It ~ Selena Gomez      ",
  "Complicated ~ Avril Lavigne    ",
  "Confessions (Part-2) ~ Usher    ",
  "Congratulations ~ Cliff Richard       ",
  "Controlla ~ Drake     ",
  "Cool ~ Jonas Brothers    ",
  "Copacabana (At The Copa) ~ Barry Manilow      ",
  "Copacabana ~ Barry Manilow      ",
  "Could I Have This Kiss Forever ~ Whitney Houston & Enrique Iglesias    ",
  "Could It Be I'm Falling In Love ~ Spinners      ",
  "Could You Be Loved ~ Bob Marley & The Wailers     ",
  "Count On Me ~ Whitmey Houston & Cece Winans   ",
  "Counting Stars ~ OneRepublic    ",
  "Coward Of The County ~ Kenny Rogers   ",
  "Crack A Bottle ~ Eminem Ft Dr. Dre & 50 Cent   ",
  "Crazy ~ K-Ci & Jojo   ",
  "Crazy ~ Kenny Rogers    ",
  "Crazy Love ~ Brian McKnight  ",
  "Crazy Stupid Love ~ Cheryl Cole ft. Tinie Tempah   ",
  "Creep ~ Radiohead     ",
  "Creep ~ TLC.     ",
  "Creepin' In ~ Norah Jones & Dolly Parton  ",
  "Criticise ~ Alexander O'Neal    ",
  "Cruel ~ Snakehips ft. ZAYN    ",
  "Cruel Summer ~ Bananarama     ",
  "Cruisin' ~ D'Angelo     ",
  "Cruisin ~ Smokey Robinson       ",
  "Crush ~ Jennifer Paige   ",
  "Crush On You ~ The Jets    ",
  "Cry Me A River ~ Justin Timberlake   ",
  "Crying for No Reason ~ Katy B     ",
  "Crystal Chandeliers ~ Billie Jo Spears ~ Charlie Pride    ",
  "Cupid ~ 112     ",
  "Cups (Pitch Perfects When Im Gone) ~ Anna Kendrick  ",
  "D.I.S.C.O. ~ Ottawan       ",
  "Da Ya Think I'm Sexy ~ Rod Stewart    ",
  "Dance Monkey ~ Tones & I    ",
  "Dance To The Music ~ Sly & The Family Stone      ",
  "Dance With Me ~ Debelah Morgan  ",
  "Dance With My Father ~ Luther Vandross   ",
  "Dancing In The Moonlight ~ Toploader        ",
  "Dancing On My Own ~ Calum Scott    ",
  "Dancing Queen ~ ABBA.    ",
  "Dancing With A Stranger ~ Sam Smith, Normani       ",
  "Dandelions ~ Ruth B       ",
  "Danger (Been So Long) ~ Mystikal & Nivea.  ",
  "Dangerous Love ~ Fuse ODG  ft. Sean Paul   ",
  "Dangerous Woman ~ Ariana Grande         ",
  "Dark Horse ~ Katy Perry ft. Juicy J    ",
  "Day 0 (The Banana Boat Song) ~ Harry Belafonte    ",
  "Day Time Friends ~ Kenny Rogers   ",
  "Daylight ~ Maroon 5     ",
  "Dear Darlin' ~ Olly Murs    ",
  "Dear Future Husband ~ Meghan Trainor   ",
  "Dear Lie ~ TLC    ",
  "Dear Mama ~ 2 Pac     ",
  "December, 1963 (Oh, What A Night) ~ 4 Seasons.    ",
  "Deliverance ~ Bubba Sparxxx    ",
  "Delusional ~ Chris Brown   ",
  "Demons ~ Imagine Dragons       ",
  "Despacito ~ Justin Bieber ft. Ariana Grande   ",
  "Diamond ~ Rihanna     ",
  "Diamonds From Sierra Leone ~ Kanye West       ",
  "Diamonds On The Sole Of Her Shoes ~ Paul Simon       ",
  "Diary ~ Alicia Keys.    ",
  "Die Another Day ~ Madonna   ",
  "Die With A Smile ~ Lady Gaga, Bruno Mars  ",
  "Die Young ~ Ke$ha      ",
  "Diferences ~ Ginuwine  ",
  "Diggin' On You ~ TLC     ",
  "Dilemma ~ Nelly & Kelly Rowland   ",
  "Din't We Almost Have It All ~ Whitney Houston    ",
  "Dirty Diana ~ Michael Jackson     ",
  "Dirty Little Secret ~ The All-American Rejects    ",
  "Disco Inferno ~ 50 Cent   ",
  "Disturbia ~ Rihanna     ",
  "Dj Got Us Fallin' In Love ~ Usher ft. Pitbull      ",
  "Do It To Me ~  Lionel Richie    ",
  "Do Me ~ Bell Biv Devoe    ",
  "Do They Know Its Christmas ~ Band Aid 30    ",
  "Do You ~ Ne-Yo   ",
  "Do You Know (What It Takes) ~ Robyn  ",
  "Do You Really Want To Hurt Me ~ Culture Club     ",
  "Do You Want To Build A Snowman ~ Kristen Bell   ",
  "Do-Bi-Doo (Inst.) ~ Kamikazee ",
  "Domino ~ Jessie J.      ",
  "Don't ~ Ed Sheeran    ",
  "Don't Be Hard On Yourself ~ Jess Glynne   ",
  "Don't Be Stupid (You Know I Love You) ~ Shania Twain  ",
  "Don't Call Me Up ~ Mabel  ",
  "Don't Cry For Me Argentina ~ Evita   ",
  "Don't Fall In Love With A Dreamer ~ Kenny Rogers and Kim Carnes   ",
  "Don't Go Breaking My Heart ~ Backstreet Boys   ",
  "Don't Judge Me ~ Chris Brown    ",
  "Don't Know Much ~ Linda Ronstadt & Aaron Neville     ",
  "Don't Leave Me ~ Blackstreet  ",
  "Don't Leave Me Get Me ~ Pink   ",
  "Don't Let Go ~ En Vogue     ",
  "Don't Let Me Down ~ The Chainsmokers ft. Daya  ",
  "Don't Let The Sun Go Down On Me ~ Elton John  ",
  "Don't Matter ~ Akon    ",
  "Don't Mind ~ Kent Jones  ",
  "Don't Say Goodbye Girl ~ Tevin Campbell   ",
  "Don't Speak ~ No Doubt    ",
  "Don't Stop ~ 5 Seconds of Summer   ",
  "Don't Stop Believin' ~ Journey     ",
  "Don't Stop The Music ~ Michael Jackson  ",
  "Don't Stop The Music ~ Rihanna  ",
  "Don't Stop Till You Get Enough ~ Michael Jackson  ",
  "Don't Take It Personal (Just One OF Dem Days) ~ Monica   ",
  "Don't Talk Away ~ Jade      ",
  "Don't Tell 'Em ~ Jeremih ft YG     ",
  "Don't Tell Me ~ Avril Lavigne      ",
  "Don't Tell Me ~ Madonna    ",
  "Don't Turn Around ~ Ace of Base       ",
  "Don't Wake Me Up ~ Chris Brown   ",
  "Don't Wanna Be A Player ~ Joe   ",
  "Don't Wanna Lose You ~ Gloria Estefan & Miami Sound Machine  ",
  "Don't Worry Be Happy ~ Bobby McFerrin   ",
  "Don't Worry Child ~ Swedish House Mafia ft. John Martin     ",
  "Doo Wop (That Thing) ~ Lauryn Hill   ",
  "Down Low (Nobody Has To Know) ~ R. Kelly     ",
  "Down Under ~ Men At Work     ",
  "Downfall ~ Matchbox Twenty    ",
  "Drag Me Down ~ One Direction  ",
  "Dragostea Din Tei ~ Ozone     ",
  "Dreamlover ~ Bobby Darin   ",
  "Dreamlover ~ Mariah Carey     ",
  "Dreams ~ Gabrielle      ",
  "Drift Away ~ Uncle Kracker & Dobie Gray    ",
  "Drinking From The Bottle ~ Calvin Harris ft. Tinie Tempah    ",
  "Drive By ~ Train     ",
  "Drivers License ~ Olivia Rodrigo  ",
  "Drops Of Jupiter (Tell Me) ~ Train   ",
  "Drowning ~ Backstreet Boys     ",
  "Drunk In Love ~ Beyonce ft. Jay-Z ",
  "Drunk In Love ~ Rihanna   ",
  "Dynamite ~ Taio Cruz     ",
  "Early In The Morning ~ The Gap Band     ",
  "Earned It (Fifty Shades Of Grey) ~ The Weeknd     ",
  "Earth ~ Lil Dicky  ",
  "Earthquake ~ Labrinth ft. Tinie Tempah   ",
  "Eastside ~ Benny Blanco, Khalid, Halsey   ",
  "Easy ~ Commodores   ",
  "Easy On Me ~ Adele  ",
  "Elastic Heart ~ Sia         ",
  "Electricity ~ The Tiny Cities     ",
  "Empire State Of Mind ~ Alicia Keys      ",
  "Empire State Of Mind ~ Jay-Z ft. Alicia Keys     ",
  "End Of The Road ~ Boyz II Men     ",
  "Endless Love ~ Lionel Richie & Diana Ross    ",
  "Energy ~ Keri Hilson    ",
  "Erase & Rewind ~ The Cardigans     ",
  "Escape ~ Enrique Iglesias      ",
  "Especially For You ~ Kylie Minogue & Jason Donovan     ",
  "Eternal Flame ~ Atomic Kitten   ",
  "Evening Star ~ Kenny Rogers  ",
  "Every Day of the Week ~ Jade     ",
  "Every Little Step ~ Bobby Brown    ",
  "Every Little Thing I Do ~ Soul For Real     ",
  "Every Morning ~ Sugar Ray     ",
  "Every Other Time ~ LFO          ",
  "Every Time I Close My Eyes ~ Babyface      ",
  "Everybody Knows ~ John Legend    ",
  "Everyday Is A Winding Road ~ Sheryl Crow    ",
  "Everything I Do (I Do It For You) ~ Bryan Adams       ",
  "Everything You Want ~ Vertical Horizon      ",
  "Everytime ~ Britney Spears    ",
  "Everytime You Go Away ~ Paul Young     ",
  "Everywhere ~ Fleetwood Mac      ",
  "Everywhere ~ Michelle Branch     ",
  "Exhale (Shoop Shoop) ~ Whitney Houston        ",
  "Eye Of The Tiger ~ Survivor     ",
  "Faded ~ Allan Walker   ",
  "Faith ~ George Michael  ",
  "Fake Love ~ Drake   ",
  "Fallin' ~ Alicia Keys    ",
  "Fallin Down ~ Avril Lavigne     ",
  "Falling Again ~ Don Williams  ",
  "Falling Slowly ~ Glen Hansard & Marketa Irglova    ",
  "Family Affair ~ Mary J. Blige    ",
  "Family Portrait ~ Pink     ",
  "Fancy  ~ Iggy Azalea  ft. Charli XCX   ",
  "Fantasy ~ Mariah Carey    ",
  "Fast Car ~ Jonas Blue  ft. Dakota    ",
  "Fast Car ~ Tracy Chapman       ",
  "Feel It Still ~ Portugal The Man     ",
  "Feel The Love ~ Rudimentals ft. John Newman   ",
  "Feel This Moment ~ Pitbull ft. Christina Aguilera      ",
  "Feelin' Myself  ~ Will.I.Am ft Miley Cyrus, French Montana, Wiz Khalifa & DJ Mustard  ",
  "Feelin' On Yo Booty ~ R. Kelly   ",
  "Feeling Good ~ Michael Bublé   ",
  "Feelings ~ Morris Albert     ",
  "Feels Good (Don't Worry Bout A Thing) ~ Naughty By Nature & 3LW   ",
  "Fernando ~ ABBA         ",
  "Fever ~ Paggy Lee      ",
  "Fight Song ~ Rachel Platten     ",
  "Fill Me In ~ Craig David     ",
  "Final Song  ~ MØ   ",
  "Finally ~ Ce Ce Peniston    ",
  "Find Your Love ~ Drake        ",
  "Fine China ~ Chris Brown    ",
  "Finesse (Rmx) ~ Bruno Mars & Cardi B     ",
  "Fire ~ Point Sisters     ",
  "Fire On Fire ~ Sam Smith  ",
  "Fireflies ~ Owl City     ",
  "Firestone ~ Kygo ft. Conrad    ",
  "Firewoks ~ Katy Perry     ",
  "Flashdance.... What A Feeling ~ Irene Cara      ",
  "Flowers ~ Miley Cyrus   ",
  "Fly ~ Sugar Ray      ",
  "Fly Away ~ Lenny Kravitz    ",
  "Flying Without Wings ~ Ruben Studdard     ",
  "Flying Without Wings ~ Westlife     ",
  "Fool Again ~ Westlife       ",
  "Foolish Games ~ Jewel       ",
  "Footloose ~ Kenny Rogers     ",
  "For What It's Worth ~ Buffalo Springfield     ",
  "For You ~ Kenny Lattimore      ",
  "Forever ~ Chris Brown     ",
  "Forever and Ever Amen ~ Randy Travis   ",
  "Forever And Ever, Amen ~ Randy Travis  ",
  "Forever More ~ Puff Johnson      ",
  "Forget Me Nots ~ Patrice Rushen   ",
  "Forgot About Dre ~ Dr. Dre  ft. Eminem  ",
  "Fortunate ~ Maxwell    ",
  "Four Five Seconds ~ Rihanna & Kanye West & Paul McCartney    ",
  "Frankie ~ Sister Sledge  ",
  "Freak Like Me ~ Adina Howard     ",
  "Freddy My Love ~ Cindy Bullens    ",
  "Fresh ~ Kool & The Gang     ",
  "Fresh Azimin ~ Bow Wow ft. Kwon      ",
  "Fresh Prince of Bel-Air ~ TV Theme     ",
  "Friend Of Mine ~ Kelly Price   ",
  "Friends (I'll Be There For You) ~TV Theme     ",
  "Friends ~ Jody Watley     ",
  "FRIENDS ~ Marshmello & Anne-Marie     ",
  "Friends In Low Places ~ Garth Brooks     ",
  "From A Distance ~ Bette Midler      ",
  "From Me To You ~ Vyonne Chaka Chaka     ",
  "From This Moment On ~ Shania Twain & Bryan White       ",
  "Frozen ~ Madonna      ",
  "Fuck It (I Don't Want You Back) ~ Eamon      ",
  "Fuck You ~ Ceelo Green    ",
  "Fuckin' Problems ~ ASAP Rocky ft. Drake, 2 Chainz, Kendrick Lamar   ",
  "Galway Girl ~ Ed Sheeran  ",
  "Games People Play ~ Inner Circle  ",
  "Gangnam Style ~ Psy  ",
  "Gangsta Lovin' ~ Eve & Alicia Keys  ",
  "Gangsta Nation ~ Westside Connection & Nate Dogg    ",
  "Gangstas Paradise ~ Coolio ft. L.V.   ",
  "Ganja Burn ~ Nicki Minaj   ",
  "Gansta's Paradise ~ Coolio      ",
  "Gasolina ~ Daddy Yankee    ",
  "Gecko (Overdrive) ~ Oliver Heldens Ft. Becky Hill    ",
  "Genie In A Bottle ~ Christina Aguilera    ",
  "Georgia On My Mind ~ Ray Charles     ",
  "Get Busy ~ Sean Paul     ",
  "Get Down On It ~ Kool & The Gang     ",
  "Get Here ~ Oleta Adams     ",
  "Get Low ~ The Eastside Boys & Ying Yang Twins    ",
  "Get Lucky ~ Daft Punk ft. Pharrell Williams   ",
  "Get Out Of My Dreams, Get Into My Car ~ Billy Ocean      ",
  "Get To Know Ya ~ Maxwell       ",
  "Get Ugly ~ Jason Derulo   ",
  "Get Up (I Feel Like Being A Sex Machine) ~ James Brown     ",
  "Get Ur Freak On ~ Missy Elliott      ",
  "Gettin' Jiggy With It ~ Will Smith     ",
  "Ghost ~ Ella Henderson    ",
  "Ghostbusters ~ Ray Parker. JR  ",
  "Giant ~ Calvin Harris, Rag'n'Bone Man     ",
  "Gimme Hope Jo'anna ~ Eddy Grant      ",
  "Gimme The Light ~ Sean Paul    ",
  "Gin and Juice ~ Snoop Doggy Dogg  ",
  "Girl From Ipanema ~ Astrud Gilberto    ",
  "Girl I'm Gonna Miss You ~ Milli Vanilli      ",
  "Girl On TV ~ LFO      ",
  "Girl, You Know Its True ~ Milli Vanilli      ",
  "Girlfriend ~ Pebbles   ",
  "Girls Just Want To Have Fun ~ Cyndi Lauper      ",
  "Girls Like ~ Tinie Tempah ft. Zara Larsson   ",
  "Girls Like You ~ Maroon 5, Cardi B   ",
  "Girls On Fire (Inferno) ~ Alicia Keys ft. Nicki Minaj    ",
  "Give Me One Reason ~ Tracy Chapman   ",
  "Give Me The Night ~ George Benson     ",
  "Give Yourself A Try ~ The 1975   ",
  "Gives You Hell ~ All American Rejects     ",
  "Givin' Me A Rush ~ Tyra B.     ",
  "Giving You The Best That I Got ~ Anita Baker    ",
  "Gloria ~ Laura Branigan    ",
  "Go On Girl ~ Ne-Yo      ",
  "Go The Distance ~ Michael Bolton     ",
  "God Is A Woman ~ Aviones de Papel     ",
  "God's Plan ~ Drake     ",
  "Going Back to Cali  ~ Notorious B I G   ",
  "Going Under ~ Evanescence        ",
  "Good Enough ~ Bobby Brown        ",
  "Good Feeling ~ Flo-Rida      ",
  "Good Life ~ G-Eazy x Kehlani   ",
  "Good Time ~ Owl City & Carly Rae Jepsen     ",
  "Good Times ~ Chic          ",
  "Goodbye My Lover ~ James Blunt      ",
  "Goodbyes ~ Post Malone ft. Young Thug   ",
  "Goodness of God ~ CeCe Winans    ",
  " Gotham City ~ R. Kelly   ",
  "Gotta Tell You ~ Samantha Mumba    ",
  "Greatest Love Of All ~ Whitney Houston      ",
  "Green Light ~ Lorde   ",
  "Green, Green Grass Of Home ~ Tom Jones    ",
  "Grenade ~ Bruno Mars   ",
  "GrooveJet ~ Dj Spiller      ",
  "Guantanamera (Lyrics) ~ Wyclef Jean ft. Lauryn Hill   ",
  "Guantanamera ~ Celie Cruz     ",
  "Gypsy Woman ~ Crystal Waters       ",
  "Habibi Nour El Ain ~ Amr Diab  ",
  "Hakuna Matata ~ The Lion King  ",
  "Hall Of Fame ~ The Script ft. Will.I.Am     ",
  "Hallelujah ~ Alexandra Burke     ",
  "Halo ~ Beyonce        ",
  "Hands ~ Jewel       ",
  "Hands To Myself ~ Selena Gomez   ",
  "Happier ~ Marshmello ft. Bastille     ",
  "Happier Than Ever ~ Billie Eilish  ",
  "Happy ~ Pharrell Williams   ",
  "Happy Birthday ~  ",
  "Happy Birthday ~ Stevie Wonder     ",
  "Happy Days Theme ~   ",
  "Happy People ~ R. Kelly        ",
  "Happy Together ~ The Turtles     ",
  "Hard Knock Life ~ Jay-Z      ",
  "Harder To Breathe ~ Maroon 5  ",
  "Hardwired ~ Metallica   ",
  "Hark! The Herald Angels Sing ~   (Xmas Song)     ",
  "Hate That I Love You ~ Rihanna & Ne-Yo       ",
  "Havana ~ Camila Cabello ft. Young Thug  ",
" Have you Ever ~ Brandy   ",
  "Have You Ever Really Loved A Woman ~ Bryan Adams    ",
  "Have You Ever Seen The Rain ~ Creedence Clearwater Revival      ",
  "Have You Seen Her ~ Mc Hammer        ",
  "He Wasn't Man Enough ~ Toni Braxton     ",
  "Head Over Feet ~ Alanis Morissette     ",
  "Headlines ~ Drake      ",
  "Heal The World ~ Michael Jackson    ",
  "Heard It All Before ~ Sunshine Anderson      ",
  "Heart Attack ~ Demi Lovato   ",
  "Heart Attack ~ Trey Songz     ",
  "Heartbreaker ~ Dolly Parton    ",
  "Heathens ~ Twenty One Pilots   ",
  "Heatwave ~ Wiley ft. Rymez & Ms D      ",
  "Heaven ~ Solo      ",
  "Heaven Must Be Missing An Angel ~ Tavares       ",
  "Heaven Sent ~ Keyshia Cole   ",
  "Hello ~ Adele     ",
  "Hello ~ Lionel Richie      ",
  "Hello Again ~ Neil Diamond       ",
  "Hemorrhage (In My Hands) ~ Fuel    ",
  "Here And Now ~ Luther Vandross  ",
  "Here Comes The Hotstepper ~ Ini Kamoze  ",
  "Here For The Party ~ Gretchen Wilson  ",
  "Here With Me ~ Dido   ",
  "Here With Me ~ Marshmello  ft. CHVRCHES     ",
  "Here Without You ~ 3 Doors Down      ",
  "Here You Come Again ~ Dolly Parton     ",
  "Hero ~ Enrique Iglesias      ",
  "Hero ~ Mariah Carey     ",
  "He's Got The World ~       ",
  "Hey Brother ~ Avicii        ",
  "Hey Leonardo (She Likes Me For Me) ~ Blessed Union of Souls    ",
  "Hey Ma ~ Cam'ron & Juelz Santana & Freekey Zekey & Kay Slay   ",
  "Hey Mr. Dj ~ Zhane         ",
  "Hey Soul Sister ~ Train    ",
  "Hideaway ~ Kiesza      ",
  "High ~ Lighthouse Family      ",
  "High Hopes ~ Panic! At The Disco  ",
  "Hip Hop Hooray ~ Naughty By Nature   ",
  "Hips Dont Lie ~ Shakira ft. Wyclef Jean   ",
  "History ~ One Direction   ",
  "Hit 'Em Up Style (Oops) ~ Ble Cantrell     ",
  "Hit Me Off ~ New Edition     ",
  "Hit The Road Jack ~ Ray Charles    ",
  "Ho Hey ~ The Lumineers   ",
  "Hold Back The River ~ James Bay     ",
  "Hold Me ~ Whitney Houston & Teddy Pendergrass      ",
  "Hold My Hand ~ Jess Glynne    ",
  "Hold My Hand ~ Michael Jackson ft. Akon  ",
  "Hold On ~ Wilson Phillips      ",
  "Hold On, We're Going Home ~ Drake ft. Majid Jordan     ",
  "Holding Back The Years ~ Simply Red     ",
  "Holes ~ Passenger      ",
  "Holiday ~ Madonna      ",
  "Holy Grail ~ Jay-Z ft. Justin Timberlake   ",
  "Homeland ~ Kenny Rogers    ",
  "Hometown Glory ~ Adele   ",
  "Hooked On You ~ Silk    ",
  "Hot Hot Hot ~ Buster Poindexter   ",
  "Hot In Here ~ Nelly   ",
  "Hot Right Now ~ Dj Fresh ft. Rita Ora      ",
  "Hot Stuff ~ Donna Summer     ",
  "Hotel California ~ The Eagles    ",
  "Hotline Bling ~ Drake      ",
  "House Of The Rising Sun ~ The Animals      ",
  "How Am I Supposed To Live Without You ~ Michael Bolton       ",
  "How Bizarre ~ OMC     ",
  "How Come How Long ~ Babyface   ",
  "How Could An Angel Break My Heart ~ Toni Braxton & Kenny G  ",
  "How Deep Is Your Love ~ Calvin Harris & Disciples    ",
  "How Deep Is Your Love ~ The Bee Gees     ",
  "How Do I Breathe ~ Mario     ",
  "How Do I Live ~LeANN Rimes      ",
  "How I Love You ~ Engelbert Humperdinck  ",
  "How Long Will I Love You ~ Ellie Goulding  ",
  "How We Do ~ The Game   ",
  "How Will I Know ~ Whitney Houston     ",
  "How You Remind Me ~ Nickelback      ",
  "How's It Going To Be ~ Third Eye Blind     ",
  "Human ~ Pretenders       ",
  "Human ~ Rag'n'Bone Man    ",
  "Human Nature ~ Michael Jackson     ",
  "Humble ~ Kendrick Lamar   ",
  "Hunger ~ Florence & The Machines   ",
  "Hymn For The Weeknd ~ Coldplay   ",
  "I  ~  Kendrick Lamar     ",
  "I Adore Mi Amor ~ Color Me Badd    ",
  "I Ain't Mad At Cha ~ 2 Pac     ",
  "I Am ~ Mary J Blige     ",
  "I Believe I Can Fly ~ Space Jam     ",
  "I Believe In You ~ Don Williams     ",
  "I Call It ~ Love Lionel Richie     ",
  "I Can Love You Like That ~ All-4-One    ",
  "I Can See Clearly Now ~ Jimmy Cliff    ",
  "I Can't Feel My Face ~ The Weeknd    ",
  "I Can't Unlove You ~ Kenny Rogers   ",
  "I Can't Wait ~ Nu Shooz     ",
  "I Could Be The One (Nicktim) ~ Avicii vs Nicky Romero ",
  "I Cry ~ Flo Rida    ",
  "I Don't Care ~ Ed Sheeran & Justin Bieber  ",
  "I Don't Need You ~ Kenny Rogers   ",
  "I Don't Wanna Cry ~ Mariah Carey  ",
  "I Don't Wanna Live Forever ~ Taylor Swift, Zayn ",
  "I Don't Want To miss A Thing ~ Aerosmith    ",
  "I Don't Want To Wait ~ Paula Cole     ",
  "I Drink Wine ~ Adele      ",
  "I Drove All Night ~ Celine Dion    ",
  "I Feel It Coming ~ The Weeknd  ft. Daft Punk  ",
  "I Found You ~ BeBe Winans      ",
  "I Got U ~ Duke Dumont ft. Jax Jones  ",
  "I Got You (I Feel Good) ~ James Brown    ",
  "I Got You Babe ~ Sonny & Cher     ",
  "I Gotta Feeling ~ Black Eyed Peas     ",
  "I Hate U, I Love U ~ Gnash ft. Olivia O'brien    ",
  "I Have A Dream ~ ABBA   ",
  "I Have A Dream ~ Westlife      ",
  "I Have Nothing ~ Whitney Houston      ",
  "I Just Called To Say I Love You ~ Stevie Wonder     ",
  "I Just Can't Stop Loving You ~ Michael Jackson   ",
  "I Just Can't Wait To Be King ~ Lion King    ",
  "I Kissed A Girl ~ Katy Perry      ",
  "I Knew I Loved You ~ Savage Garden      ",
  "I Knew You Were Trouble ~ Taylor Swift     ",
  "I Lay My Love On You ~ Westlife    ",
  "I Learned From The Best ~ Whitney Houston      ",
  "I Like It ~ Cardi B, Bad Bunny & J Balvin   ",
  "I Love It ~ Icona Pop ft. Charli XCX  ",
  "I Love Me Some Him ~ Toni Braxton    "

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

document.getElementById("liveRequestBtn").addEventListener("click", () => {
  document.getElementById("liveRequestBtn").classList.add("hidden");
  document.getElementById("kcont").classList.add("hidden");
  document.getElementById("ncont").classList.add("hidden");
  document.getElementById("mixcont").classList.add("hidden");
  document.getElementById("qr").classList.add("hidden");
  document.getElementById("requestBox").classList.remove("hidden");
  document.getElementById("backbtn").classList.add("hidden");
});
    // Select the elements
    const kcont = document.getElementById('kcont');
    const ncont = document.getElementById('ncont');
    const backbtn = document.getElementById('back-btn');
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
      backbtn.style.display = 'none';
      ncont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      // Show the genres section
      genresSection.style.display = 'block';
      kvidz.style.display = 'block';
    });

        mixcont.addEventListener('click', () => {
      // Hide the mix div
      kcont.style.display = 'none';
      backbtn.style.display = 'none';
      ncont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      // Show the genres section
      
         
    });
        ncont.addEventListener('click', () => {
      // Hide the mix div
      kcont.style.display = 'none';
      backbtn.style.display = 'none';
      ncont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      // Show the genres section
      genresSection.style.display = 'block'; 
      kvidz.style.display = 'block';
    });

 

    kvidz.addEventListener('click', () => {
      // Hide the live div
      kcont.style.display = 'none';
      backbtn.style.display = 'none';
      ncont.style.display = 'none';
      mixcont.style.display = 'none';
      liveRequestBtn.style.display = 'none';
      qr.style.display = 'none';
      kvidz.style.display = 'none';
      container1.style.display = 'none';
      // Show the genres section
      container1.style.display = 'block';
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

// Data for categories and their video files
const category2Data = {
  arabic: [
    { src: "soap1.mp4", title: "Soap Video 1" },
    { src: "soap2.mp4", title: "Soap Video 2" },
  ],
  chinese: [
    { src: "./resouces/karaoke/setit.mp4", title: "set it"},
    { src: "electronics2.mp4", title: "Electronics Video 2" },
  ],
dancehall: [
    { src: "soap1.mp4", title: "Soap Video 1" },
    { src: "soap2.mp4", title: "Soap Video 2" },
  ],
  eastAfrican: [
    { src: "./resouces/karaoke/setit.mp4", title: "set it"},
    { src: "electronics2.mp4", title: "Electronics Video 2" },
  ],
gospel: [
    { src: "soap1.mp4", title: "Soap Video 1" },
    { src: "soap2.mp4", title: "Soap Video 2" },
  ],
  international: [
    { src: "./resouces/karaoke/setit.mp4", title: "set it"},
    { src: "electronics2.mp4", title: "Electronics Video 2" },
  ],
lingala: [
    { src: "soap1.mp4", title: "Soap Video 1" },
    { src: "soap2.mp4", title: "Soap Video 2" },
  ],
  roots: [
    { src: "./resouces/karaoke/setit.mp4", title: "set it"},
    { src: "electronics2.mp4", title: "Electronics Video 2" },
  ],
traditional: [
    { src: "soap1.mp4", title: "Soap Video 1" },
    { src: "soap2.mp4", title: "Soap Video 2" },
  ],
  naija: [
    { src: "./resouces/karaoke/setit.mp4", title: "set it"},
    { src: "electronics2.mp4", title: "Electronics Video 2" },
  ],
xmass: [
    { src: "./resouces/karaoke/setit.mp4", title: "set it"},
    { src: "electronics2.mp4", title: "Electronics Video 2" },
  ],
};

// References to DOM elements
const categoryList = document.getElementById("category2-list");
const videoList = document.getElementById("video-list");
const detailsTitle = document.getElementById("details2-title");
const videoPlayer = document.getElementById("video-player");
const player = document.getElementById("player");
const closeBtn = document.getElementById("close-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const backBtn = document.getElementById("back-btn");

// Function to render videos based on category
function displayVideos(category2) {
  videoList.innerHTML = "";
  details2Title.textContent2 = category2 ? `Videos in ${category2}` : "Select a Category2";

  if (category2Data[category2]) {
    category2Data[category2].forEach((video) => {
      const videoElement = document.createElement("video");
      videoElement.src = video.src;
      videoElement.title = video.title;

      videoElement.addEventListener("click", () => {
        player.src = video.src;
        videoPlayer.classList.remove("hidden");
        player.play();
      });

      videoList.appendChild(videoElement);
    });
  }
}

// Close video player
closeBtn.addEventListener("click", () => {
  player.pause();
  videoPlayer.classList.add("hidden");
  player.src = "";
});

// Automatically close player at the end of the video
player.addEventListener("ended", () => {
  player.pause();
  videoPlayer.classList.add("hidden");
  player.src = "";
});

// Toggle fullscreen mode
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    videoPlayer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Event listener for category clicks
categoryList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const selectedCategory2 = e.target.getAttribute("data-category2");
    displayVideos(selectedCategory2);
  }
});

// Back button functionality
backBtn.addEventListener("click", () => {
  window.history.back();
});

// Default view
displayVideos();
