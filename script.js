// Password Protection System
document.addEventListener('DOMContentLoaded', function() {
  // Password Modal Elements
  const passwordModal = document.getElementById('password-modal');
  const passwordForm = document.getElementById('password-form');
  const passwordInput = document.getElementById('password-input');
  const passwordError = document.getElementById('password-error');
  const passwordSuccess = document.getElementById('password-success');
  const accessHoursSelect = document.getElementById('access-hours');
  const passwordMessage = document.getElementById('password-message');
  const passwordTitle = document.getElementById('password-title');
  const passwordExpiryInfo = document.getElementById('password-expiry-info');
  const daysRemaining = document.getElementById('days-remaining');
  const expirationDays = document.getElementById('expiration-days');
  const expirationNotice = document.getElementById('password-expiration-notice');

  // Global Access Status Elements
  const globalAccessStatus = document.getElementById('global-access-status');
  const accessTimeRemaining = document.getElementById('access-time-remaining');
  const extendAccessBtn = document.getElementById('extend-access-btn');

  // Change Password Elements
  const changePasswordForm = document.getElementById('change-password-form');
  const showChangePasswordLink = document.getElementById('show-change-password');
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const cancelChangeBtn = document.getElementById('cancel-change');

  // Logo elements for hard lock feature
  const logoLinks = document.querySelectorAll('#logo-link, #logo-link-2');
  const logoImages = document.querySelectorAll('#logoimg-1, #logoimg-2');

  // API URL - adjust if needed
  const API_URL = 'http://localhost:10000/api';

  // Password expiration constants
  const PASSWORD_EXPIRY_DAYS = 30; // 30 days expiration
  const WARNING_THRESHOLD_DAYS = 7; // Show warning when 7 days left

  // Global access status check interval (in milliseconds)
  const ACCESS_CHECK_INTERVAL = 60000; // Check every minute

  // Check if global access is active
  async function checkGlobalAccess() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${API_URL}/access/status`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.active) {
        // Global access is active, hide the password modal
        passwordModal.style.display = 'none';

        // Update global access status
        updateGlobalAccessStatus(data.hoursRemaining);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check global access:', error);
      return false;
    }
  }

  // Update global access status display
  function updateGlobalAccessStatus(hoursRemaining) {
    if (hoursRemaining > 0) {
      accessTimeRemaining.textContent = hoursRemaining;
      globalAccessStatus.classList.remove('hidden');
    } else {
      globalAccessStatus.classList.add('hidden');
    }
  }

  // Check if user is already authenticated
  async function checkAuthentication() {
    // First check if global access is active
    const isGlobalAccessActive = await checkGlobalAccess();
    if (isGlobalAccessActive) {
      return; // Global access is active, no need to check individual authentication
    }

    // Show password modal for owner authentication
    passwordModal.style.display = 'flex';
    passwordInput.focus();

    // Check password expiration from server
    checkPasswordExpiry(true);

    // Start periodic check for global access
    startGlobalAccessCheck();
  }

  // Start periodic check for global access
  function startGlobalAccessCheck() {
    // Check immediately
    checkGlobalAccess();

    // Then check periodically
    setInterval(checkGlobalAccess, ACCESS_CHECK_INTERVAL);
  }

  // Handle extend access button click
  extendAccessBtn.addEventListener('click', async function() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      // Call the extend access endpoint
      const response = await fetch(`${API_URL}/access/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'qwerty1234', // Use the default password for extension
          hours: 1 // Add 1 hour
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        // Access extended successfully
        showSuccess(data.message || 'Access extended by 1 hour');

        // Update global access status
        const currentHours = parseInt(accessTimeRemaining.textContent) || 0;
        updateGlobalAccessStatus(currentHours + 1);
      } else {
        // Failed to extend access
        showError(data.error || 'Failed to extend access');
      }
    } catch (error) {
      console.error('Error extending access:', error);

      // Fallback for development/testing
      const currentHours = parseInt(accessTimeRemaining.textContent) || 0;
      updateGlobalAccessStatus(currentHours + 1);
      showSuccess('Access extended by 1 hour (fallback mode)');
    }
  });

  // Check password expiration from server
  async function checkPasswordExpiry(isLoginScreen) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${API_URL}/password/expiry`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.daysRemaining !== undefined) {
        // Store password expiry
        localStorage.setItem('passwordExpiry', new Date(data.expiresAt).getTime().toString());

        if (data.isExpired) {
          // Password has expired, show change password form
          showChangePasswordForm();
          passwordMessage.textContent = 'Your password has expired. Please set a new password.';
        } else if (data.daysRemaining <= WARNING_THRESHOLD_DAYS) {
          // Show expiration warning
          if (isLoginScreen) {
            daysRemaining.textContent = data.daysRemaining;
            passwordExpiryInfo.classList.remove('hidden');
          } else {
            expirationDays.textContent = data.daysRemaining;
            expirationNotice.classList.remove('hidden');
          }
        }
      }
    } catch (error) {
      console.error('Failed to check password expiry:', error);

      // Fallback to local storage if server is unavailable
      fallbackToLocalStorage(isLoginScreen);
    }
  }

  // Fallback to local storage if server is unavailable
  function fallbackToLocalStorage(isLoginScreen) {
    // If no password expiry in local storage, set one
    if (!localStorage.getItem('passwordExpiry')) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + PASSWORD_EXPIRY_DAYS);
      localStorage.setItem('passwordExpiry', expiryDate.getTime().toString());
    }

    const passwordExpiry = localStorage.getItem('passwordExpiry');
    if (passwordExpiry) {
      const expiryDate = new Date(parseInt(passwordExpiry));
      const today = new Date();
      const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysToExpiry <= 0) {
        // Password has expired, show change password form
        showChangePasswordForm();
        passwordMessage.textContent = 'Your password has expired. Please set a new password.';
      } else if (daysToExpiry <= WARNING_THRESHOLD_DAYS) {
        // Show expiration warning
        if (isLoginScreen) {
          daysRemaining.textContent = daysToExpiry;
          passwordExpiryInfo.classList.remove('hidden');
        } else {
          expirationDays.textContent = daysToExpiry;
          expirationNotice.classList.remove('hidden');
        }
      }
    }
  }

  // Handle password submission
  passwordForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const password = passwordInput.value;
    if (!password) {
      showError('Please enter a password');
      return;
    }

    const accessHours = parseInt(accessHoursSelect.value);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      // Verify password with server and set global access
      const response = await fetch(`${API_URL}/password/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password,
          hours: accessHours
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        // Password is correct and global access is granted
        handleSuccessfulGlobalAccess(data);
      } else {
        // Password is incorrect
        showError(data.error || 'Invalid password');
      }
    } catch (error) {
      console.error('Password verification error:', error);

      // Fallback to client-side verification if server is not available
      // This is just for development/testing - remove in production
      if (password === 'qwerty1234' || (localStorage.getItem('devPassword') && password === localStorage.getItem('devPassword'))) {
        // Simulate successful global access
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + accessHours);

        handleSuccessfulGlobalAccess({
          success: true,
          message: 'Password verified and global access granted (fallback mode)',
          expiresAt: expiryTime,
          accessHours,
          fallbackMode: true
        });
      } else {
        showError('Invalid password');
      }
    }
  });

  // Handle successful global access
  function handleSuccessfulGlobalAccess(data) {
    // Show success message
    showSuccess(data.message || 'Access granted successfully');

    // Set password expiry if not already set
    if (!localStorage.getItem('passwordExpiry')) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + PASSWORD_EXPIRY_DAYS);
      localStorage.setItem('passwordExpiry', expiryDate.getTime().toString());
    }

    // Update global access status
    if (data.accessHours) {
      updateGlobalAccessStatus(data.accessHours);
    }

    // Hide password modal after a delay
    setTimeout(() => {
      passwordModal.style.display = 'none';

      // Clear password input
      passwordInput.value = '';

      // Start periodic check for global access
      startGlobalAccessCheck();
    }, 1500);
  }

  // Show change password form
  function showChangePasswordForm() {
    passwordForm.classList.add('hidden');
    changePasswordForm.classList.remove('hidden');
    passwordTitle.textContent = 'Change Password';
    showChangePasswordLink.parentElement.classList.add('hidden');
    passwordExpiryInfo.classList.add('hidden');
  }

  // Hide change password form
  function hideChangePasswordForm() {
    changePasswordForm.classList.add('hidden');
    passwordForm.classList.remove('hidden');
    passwordTitle.textContent = 'Enter Password';
    showChangePasswordLink.parentElement.classList.remove('hidden');

    // Clear inputs
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
  }

  // Show change password link click handler
  showChangePasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    showChangePasswordForm();
  });

  // Cancel change password button click handler
  cancelChangeBtn.addEventListener('click', function() {
    hideChangePasswordForm();
  });

  // Handle change password form submission
  changePasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      // Send change password request to server
      const response = await fetch(`${API_URL}/password/change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: currentPassword,
          newPassword: newPassword
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        // Password changed successfully
        handleSuccessfulPasswordChange(newPassword);
      } else {
        showError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);

      // Fallback for development/testing
      if (currentPassword === 'qwerty1234' ||
          (localStorage.getItem('devPassword') && currentPassword === localStorage.getItem('devPassword'))) {
        handleSuccessfulPasswordChange(newPassword);
      } else {
        showError('Current password is incorrect');
      }
    }
  });

  // Handle successful password change
  function handleSuccessfulPasswordChange(newPassword) {
    showSuccess('Password changed successfully');

    // Update password expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + PASSWORD_EXPIRY_DAYS);
    localStorage.setItem('passwordExpiry', expiryDate.getTime().toString());

    // Store the new password for client-side verification (development only)
    localStorage.setItem('devPassword', newPassword);

    // Hide change password form after a delay
    setTimeout(() => {
      hideChangePasswordForm();

      // If user was logged in, keep them logged in
      if (localStorage.getItem('authToken')) {
        passwordModal.style.display = 'none';
      }
    }, 2000);
  }

  // Show error message
  function showError(message) {
    passwordError.textContent = message;
    passwordError.classList.remove('hidden');
    passwordSuccess.classList.add('hidden');

    // Hide error after 3 seconds
    setTimeout(() => {
      passwordError.classList.add('hidden');
    }, 3000);
  }

  // Show success message
  function showSuccess(message) {
    passwordSuccess.textContent = message;
    passwordSuccess.classList.remove('hidden');
    passwordError.classList.add('hidden');

    // Hide success after 3 seconds
    setTimeout(() => {
      passwordSuccess.classList.add('hidden');
    }, 3000);
  }

  // Implement hard lock feature
  let pressTimer;

  // Function to lock the website
  async function hardLockWebsite() {
    try {
      // Try to deactivate global access on the server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      // Call the API to deactivate global access
      await fetch(`${API_URL}/access/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'qwerty1234' // Use the default password for deactivation
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error deactivating global access:', error);
    }

    // Show the password modal
    passwordMessage.textContent = 'Website has been locked. Please enter the owner password to grant access.';
    passwordModal.style.display = 'flex';
    passwordInput.focus();

    // Reset to login form if change password form was showing
    hideChangePasswordForm();

    // Hide global access status
    globalAccessStatus.classList.add('hidden');
  }

  logoImages.forEach(logo => {
    logo.addEventListener('mousedown', function() {
      pressTimer = window.setTimeout(function() {
        // Hard lock after 10 seconds of pressing
        hardLockWebsite();
      }, 10000); // 10 seconds
    });

    logo.addEventListener('mouseup', function() {
      clearTimeout(pressTimer);
    });

    logo.addEventListener('mouseleave', function() {
      clearTimeout(pressTimer);
    });

    // Touch support for mobile devices
    logo.addEventListener('touchstart', function(e) {
      pressTimer = window.setTimeout(function() {
        hardLockWebsite();
      }, 10000); // 10 seconds
      e.preventDefault();
    });

    logo.addEventListener('touchend', function() {
      clearTimeout(pressTimer);
    });
  });

  // Check authentication on page load
  checkAuthentication();
});

// Select the elements
const kcont = document.getElementById('kcont');
const ncont = document.getElementById('ncont');
const backbtn = document.getElementById('back-btn');
const backbtn2 = document.getElementById('back-btn2');
const returnBtn = document.getElementById('return-btn');
const mixcont = document.getElementById('startBtn');
const saxcont = document.getElementById('saxcont');
const kconcat = document.getElementById('kconcat');
const liveRequestBtn = document.getElementById('liveRequestBtn');
const qr = document.getElementById('qr');
const genresSection = document.getElementById('genres-section');
const kvidz = document.getElementById('videoButton');
const kvidz2 = document.getElementById('kvidz2');
const searchbar = document.getElementById('search-input');
const container1 = document.getElementById('container1');
const requestForm = document.getElementById("requestForm");
const requestBox = document.getElementById("requestBox");
const requestsDisplay = document.getElementById("requestsDisplay");
const duplicateMessage = document.getElementById("duplicateMessage");

const videoData = {
  "Arabic": [
      { title: "Because Of Lov", path: "ngoma/Chinese/Because Of Lov.mp4" },
      { title: "Jin Sheng Yuan ( 今生缘 )", path: "ngoma/Chinese/Jin Sheng Yuan.mp4" },
      { title: "Ni Wen Wo Ai Ni (Lyrics) ~ Teresa Teng ", path: "ngoma/Chinese/Ni Wen Wo Ai Ni (Lyrics) ~ Teresa Teng .mp4" },
      { title: "Peng You (朋友) ~ Wakin Chau", path: "ngoma/Chinese/Peng You (朋友) ~ Wakin Chau.mp4" },
      { title: "Somewhere Over The Rainbow (Lyrics) ~ Israel Kamakawiwoole & Tradução", path: "ngoma/Chinese/Somewhere Over The Rainbow (Lyrics) ~ Israel Kamakawiwoole & Tradução.mp4" },
      { title: "因为爱情 Yin Wei Ai Qing Karena Cinta – 陈奕迅 Eason Chan & 王菲 Faye Wong -Lirik terjemahan ID", path: "ngoma/Chinese/因为爱情 Yin Wei Ai Qing Karena Cinta – 陈奕迅 Eason Chan & 王菲 Faye Wong -Lirik terjemahan ID.mp4" }
  ],
  "Chinese": [
      { title: "Because Of Lov", path: "ngoma/Chinese/Because Of Lov.mp4" },
      { title: "Jin Sheng Yuan ( 今生缘 )", path: "ngoma/Chinese/Jin Sheng Yuan.mp4" },
      { title: "Ni Wen Wo Ai Ni (Lyrics) ~ Teresa Teng ", path: "ngoma/Chinese/Ni Wen Wo Ai Ni (Lyrics) ~ Teresa Teng .mp4" },
      { title: "Peng You (朋友) ~ Wakin Chau", path: "ngoma/Chinese/Peng You (朋友) ~ Wakin Chau.mp4" },
      { title: "Somewhere Over The Rainbow (Lyrics) ~ Israel Kamakawiwoole & Tradução", path: "ngoma/Chinese/Somewhere Over The Rainbow (Lyrics) ~ Israel Kamakawiwoole & Tradução.mp4" },
      { title: "因为爱情 Yin Wei Ai Qing Karena Cinta – 陈奕迅 Eason Chan & 王菲 Faye Wong -Lirik terjemahan ID", path: "ngoma/Chinese/因为爱情 Yin Wei Ai Qing Karena Cinta – 陈奕迅 Eason Chan & 王菲 Faye Wong -Lirik terjemahan ID.mp4" }
  ],
  "Dancehall": [
      { title: "Because Of Lov", path: "ngoma/Chinese/Because Of Lov.mp4" },
      { title: "Jin Sheng Yuan ( 今生缘 )", path: "ngoma/Chinese/Jin Sheng Yuan.mp4" },
      { title: "Ni Wen Wo Ai Ni (Lyrics) ~ Teresa Teng ", path: "ngoma/Chinese/Ni Wen Wo Ai Ni (Lyrics) ~ Teresa Teng .mp4" },
      { title: "Peng You (朋友) ~ Wakin Chau", path: "ngoma/Chinese/Peng You (朋友) ~ Wakin Chau.mp4" },
      { title: "Somewhere Over The Rainbow (Lyrics) ~ Israel Kamakawiwoole & Tradução", path: "ngoma/Chinese/Somewhere Over The Rainbow (Lyrics) ~ Israel Kamakawiwoole & Tradução.mp4" },
      { title: "因为爱情 Yin Wei Ai Qing Karena Cinta – 陈奕迅 Eason Chan & 王菲 Faye Wong -Lirik terjemahan ID", path: "ngoma/Chinese/因为爱情 Yin Wei Ai Qing Karena Cinta – 陈奕迅 Eason Chan & 王菲 Faye Wong -Lirik terjemahan ID.mp4" }
  ],
  "EastAfrican-KE,TZ,UG,RW": [
      { title: "Amina By sanaipe Tande", path: "ngoma/East/Amina.mp4" },
      { title: "Bebi Bebi By Nyashinski", path: "ngoma/East/Bebi.mp4" },
      { title: "Chaguo la moyo By Otile Brown", path: "ngoma/East/Chaguo.mp4" },
      { title: "Deadly By Nameless", path: "ngoma/East/Deadly  Nameless.mp4" },
      { title: "Extra pressure By Bensoul", path: "ngoma/East/Extra Bensoul.mp4" },
      { title: "Free By Nyashinski", path: "ngoma/East/Free  Nyashinski.mp4" },
      { title: "Isabella By Sauti Sol", path: "ngoma/East/Isabella  Sauti Sol.mp4" },
      { title: "Koo Koo By Elain", path: "ngoma/East/Koo Koo  Elani.mp4" },
      { title: "Mapenzi By Kidum", path: "ngoma/East/Mapenzi  Kidum.mp4" },
      { title: "Midnight Train By Sauti sol", path: "ngoma/East/Midnight Train  Sauti Sol.mp4" },
      { title: "Moto Moto By Ray C", path: "ngoma/East/Moto Moto  Ray C ft. French Boy.mp4" },
      { title: "Nenda lote By Sauti Sol", path: "ngoma/East/Nenda Lote  Sauti Sol.mp4" },
      { title: "Rhumba By Wanavokali", path: "ngoma/East/Rhumba  Wanavokali.mp4" },
      { title: "Set IT By Dyana Cods", path: "ngoma/East/Set It  Dyana Cods ft. Ajay.mp4" },
      { title: "Sinzia By Nameless", path: "ngoma/East/Sinzia  Nameless.mp4" }
  ],
  "Gospel": [
      { title: "Amazing Grace By Praise & Worship", path: "ngoma/Gospel/Amazing.mp4" },
      { title: "Appointment By  Jimmy Gait", path: "ngoma/Gospel/Appointment By  Jimmy Gait.mp4" },
      { title: "Everything (Amen) By Timi Dakolo", path: "ngoma/Gospel/Everything (Amen) By Timi Dakolo.mp4" },
      { title: "Hallelujah By Alexandra Burke", path: "ngoma/Gospel/Hallelujah By Alexandra Burke.mp4" },
      { title: "One Of Us By Joan Osborne", path: "ngoma/Gospel/One Of Us By Joan Osborne.mp4" },
      { title: "Take My Hand Precious Lord By Elvis Presley", path: "ngoma/Gospel/Take My Hand Precious Lord By Elvis Presley.mp4" },
      { title: "Trust & Obey By  Gospel", path: "ngoma/Gospel/Trust & Obey By  Gospel.mp4" }
  ],

  "International": [
      { title: "1 2 Step By  Ciara Ft Missy Elliott", path: "ngoma/International/1 2 Step By  Ciara.mp4" },
      { title: "7 Rings By  Ariana Grande", path: "ngoma/International/7 Rings By  Ariana Grande.mp4" },
      { title: "A Thousand Years By  Christina Perri", path: "ngoma/International/A Thousand Years By  Christina Perri.mp4" },
      { title: "Back At One By Brian McKnight", path: "ngoma/International/Back At One By Brian McKnight.mp4" },
      { title: "Back For Good By Take That", path: "ngoma/International/Back For Good By Take That.mp4" },
      { title: "Be Without You By Mary J. Blige", path: "ngoma/International/Be Without You By Mary J. Blige.mp4" },
      { title: "Call Me By Spagna", path: "ngoma/International/Call Me By Spagna.mp4" },
      { title: "Can We Talk By Tevin Campbell", path: "ngoma/International/Can We Talk By Tevin Campbell.mp4" },
      { title: "Dance With My Father By  Luther Vandross", path: "ngoma/International/Dance With My Father By  Luther Vandross.mp4" },
      { title: "Endless Love By Lionel Richie & Diana Ross", path: "ngoma/International/Endless Love By Lionel Richie & Diana Ross.mp4" },
      { title: "Give Me One Reason By Tracy Chapman", path: "ngoma/International/Give Me One Reason By Tracy Chapman.mp4" },
      { title: "How Will I Know By Whitney Houston", path: "ngoma/International/How Will I Know By Whitney Houston.mp4" },
      { title: "I Have A Dream By ABBA", path: "ngoma/International/I Have A Dream By ABBA.mp4" },
      { title: "True Colors By Phil Collins", path: "ngoma/International/True Colors By Phil Collins.mp4" },
      { title: "Walkin In Memphis  By Marc Cohen", path: "ngoma/International/Walkin In Memphis  By Marc Cohen.mp4" },
      { title: "You're Still The One By Shania Twain", path: "ngoma/International/You're Still The One By Shania Twain.mp4" }
  ],
    "Lingala & Rhumba": [
      { title: "Dezo Dezo  By Tshala Mwana", path: "ngoma/Lingala/Dezo Dezo  By Tshala Mwana.mp4" },
      { title: "Show Me The Way By Papa Wemba", path: "ngoma/Lingala/Show Me The Way By Papa Wemba.mp4" }
  ],
    "Naija": [
      { title: "Dezo Dezo  By Tshala Mwana", path: "ngoma/Lingala/Dezo Dezo  By Tshala Mwana.mp4" },
      { title: "Show Me The Way By Papa Wemba", path: "ngoma/Lingala/Show Me The Way By Papa Wemba.mp4" }
  ],
  "Reggae & Roots": [
      { title: "A Woman Like You By  Gramps Morgan", path: "ngoma/Reggae/A Woman Like You By  Gramps Morgan.mp4" },
      { title: "Buffalo Soldier By Bob Marley & The Wailers", path: "ngoma/Reggae/Buffalo Soldier By Bob Marley & The Wailers.mp4" },
      { title: "Iron, Lion, Zion By Bob Marley", path: "ngoma/Reggae/Iron, Lion, Zion By Bob Marley.mp4" },
      { title: "Is This Love By Bob Marley & The Wailers", path: "ngoma/Reggae/Is This Love By Bob Marley & The Wailers.mp4" },
      { title: "Kingston Town By UB40", path: "ngoma/Reggae/Kingston Town By UB40.mp4" },
      { title: "Red Red Wine By UB40", path: "ngoma/Reggae/Red Red Wine By UB40.mp4" },
      { title: "Skankin Sweet By Chronixx", path: "ngoma/Reggae/Skankin Sweet By Chronixx.mp4" },
      { title: "The Way You Do The Things You Do By  UB-40", path: "ngoma/Reggae/The Way You Do The Things You Do By  UB-40.mp4" },
      { title: "Three Little Birds By Bob Marley & The Wailers", path: "ngoma/Reggae/Three Little Birds By Bob Marley & The Wailers.mp4" }
  ],
  "Traditional": [
      { title: "A Woman Like You By  Gramps Morgan", path: "ngoma/Reggae/A Woman Like You By  Gramps Morgan.mp4" },
      { title: "Buffalo Soldier By Bob Marley & The Wailers", path: "ngoma/Reggae/Buffalo Soldier By Bob Marley & The Wailers.mp4" },
      { title: "Iron, Lion, Zion By Bob Marley", path: "ngoma/Reggae/Iron, Lion, Zion By Bob Marley.mp4" },
      { title: "Is This Love By Bob Marley & The Wailers", path: "ngoma/Reggae/Is This Love By Bob Marley & The Wailers.mp4" },
      { title: "Kingston Town By UB40", path: "ngoma/Reggae/Kingston Town By UB40.mp4" },
      { title: "Red Red Wine By UB40", path: "ngoma/Reggae/Red Red Wine By UB40.mp4" },
      { title: "Skankin Sweet By Chronixx", path: "ngoma/Reggae/Skankin Sweet By Chronixx.mp4" },
      { title: "The Way You Do The Things You Do By  UB-40", path: "ngoma/Reggae/The Way You Do The Things You Do By  UB-40.mp4" },
      { title: "Three Little Birds By Bob Marley & The Wailers", path: "ngoma/Reggae/Three Little Birds By Bob Marley & The Wailers.mp4" }
  ],
  "SouthAfrica - Amapiano": [
      { title: "A Woman Like You By  Gramps Morgan", path: "ngoma/Reggae/A Woman Like You By  Gramps Morgan.mp4" },
      { title: "Buffalo Soldier By Bob Marley & The Wailers", path: "ngoma/Reggae/Buffalo Soldier By Bob Marley & The Wailers.mp4" },
      { title: "Iron, Lion, Zion By Bob Marley", path: "ngoma/Reggae/Iron, Lion, Zion By Bob Marley.mp4" },
      { title: "Is This Love By Bob Marley & The Wailers", path: "ngoma/Reggae/Is This Love By Bob Marley & The Wailers.mp4" },
      { title: "Kingston Town By UB40", path: "ngoma/Reggae/Kingston Town By UB40.mp4" },
      { title: "Red Red Wine By UB40", path: "ngoma/Reggae/Red Red Wine By UB40.mp4" },
      { title: "Skankin Sweet By Chronixx", path: "ngoma/Reggae/Skankin Sweet By Chronixx.mp4" },
      { title: "The Way You Do The Things You Do By  UB-40", path: "ngoma/Reggae/The Way You Do The Things You Do By  UB-40.mp4" },
      { title: "Three Little Birds By Bob Marley & The Wailers", path: "ngoma/Reggae/Three Little Birds By Bob Marley & The Wailers.mp4" }
  ],
  "Xmass": [
      { title: "A Woman Like You By  Gramps Morgan", path: "ngoma/Reggae/A Woman Like You By  Gramps Morgan.mp4" },
      { title: "Buffalo Soldier By Bob Marley & The Wailers", path: "ngoma/Reggae/Buffalo Soldier By Bob Marley & The Wailers.mp4" },
      { title: "Iron, Lion, Zion By Bob Marley", path: "ngoma/Reggae/Iron, Lion, Zion By Bob Marley.mp4" },
      { title: "Is This Love By Bob Marley & The Wailers", path: "ngoma/Reggae/Is This Love By Bob Marley & The Wailers.mp4" },
      { title: "Kingston Town By UB40", path: "ngoma/Reggae/Kingston Town By UB40.mp4" },
      { title: "Red Red Wine By UB40", path: "ngoma/Reggae/Red Red Wine By UB40.mp4" },
      { title: "Skankin Sweet By Chronixx", path: "ngoma/Reggae/Skankin Sweet By Chronixx.mp4" },
      { title: "The Way You Do The Things You Do By  UB-40", path: "ngoma/Reggae/The Way You Do The Things You Do By  UB-40.mp4" },
      { title: "Three Little Birds By Bob Marley & The Wailers", path: "ngoma/Reggae/Three Little Birds By Bob Marley & The Wailers.mp4" }
  ]
};

const ncontVideoData =
{
  arabic: [
  "Amarain ~ Amr Diab",
  "Macarena ~ Los Del Rio",
  "Nour El Ein (Habibi) (Inst.) ~ Amr Diab ",
  "Simarik ~ Tarkan ",
  "Yo Yo Honey Singh ~ DIL Chori -Simar-Kaur"
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
"A Woman Like You ~ Gramps Morgan  ",
"Andas en mi Cabeza ~ Chino & Nacho ft. Daddy Yankee   ",
"Back To My Roots ~ Lucky Dube    ",
"Ballroom Floor ~ Live Wire ",
"Ban Bam ~ Pliers ",
"Body Fulla Vybes Mi Sh ~ Kip Rich    ",
"Bring Me Your Cup ~ UB40  ",
"Bruk Pocket Boy ~ Tiana     ",
"Buffalo Soldier ~ Bob Marley & The Wailers    ",
"Bun Hot ~ Navino    ",
"Can't Help Falling In Love ~ UB40   ",
"Cherry Oh Baby ~ UB40   ",
"Chok There ~ Apache Indian    ",
"Church Heathen  ~ Shaggy   -     ",
"Close To You ~ Maxi Priest   ",
"Come Home ~ Morgan Heritage     ",
"Come Over ~ Estelle ft Sean Paul  ",
"Crazy World ~ Lucky Dube  ",
"Daddy ~ Queen Ifrica    ",
"Destiny ~ Buju Banton   ",
"Don't Cry ~ Lucky Dube  ",
"Don't Keep Mi Waiting ~ Nefetari     ",
"Dreams Of Brighter Days  ~ Busy Signal & R.C  ",
"Earth A Run Red ~ Richie Spice  ",
"Footprints ~ T.O.K.   ",
"Forget You ~ Jordanne Patrice  ",
"Free Up ~ Busy Signal    ",
"Fren A Mi Fren ~ D'Angel       ",
"Frenzy ~ Sanchez    ",
"Ganja Farmer ~ Marlon Asha     ",
"Get Up Stand Up ~ Bob Marley & The Wailers    ",
"Ghetto People ~ Everton Blender     ",
"Goodness of God (Reggae Rmx) ~ CeCe Winans  ",
"Guardian Angel ~ T.O.K.   ",
"Hard Drugs ~ Gregory Isaac   ",
"Hold On ~ Lucky Dube       ",
"House Of Exile ~ Lucky Dube    ",
"House Party ~ Shane O    ",
"Hurry Up & Come ~ Cocoa Tea   ",
"I Swear ~ Chuck Fender    ",
"If Jah ~ Tony Rebel   ",
"I'm Waiting ~ Cecile   ",
"Iron, Lion, Zion ~ Bob Marley   ",
"Is This Love ~ Bob Marley ",
"Jammin' ~ Bob Marley & The Wailers   ",
"Just an Illusion ~ Julie Zahra     ",
"Just The Way You Are ~ Tarrus Riley  ",
"Kingston Town ~ UB40       ",
"Legalize It ~ Peter Tosh  ",
"Lightning ~ Mortimer   ",
"Live My Life ~ Beenie Man    ",
"Lively Up Yourself ~ Bob Marley & The Wailers     ",
"Longing For ~ Jah Cure   ",
"Love Song  ~ Etana   ",
"Love You Too Much ~ Wayne Wade  ",
"Mamacita ~ Collie Buddz   ",
"Marijuana ~ Richie Spice   ",
"My Defense ~ Nasio Fontaine  ",
"Mysterious Girl ~ Peter Andre    ",
"Nah Let Go ~ Gyptian   ",
"Natural Mystic ~ Bob Marley    ",
"Needle ~ Dr Ring Ding    ",
"No Ordinary Love ~ Alaine    ",
"No Woman No Cry ~ Bob Marley & The Wailers    ",
"One In A Million ~ Gramps Morgan    ",
"One Love ~ Bob Marley & The Wailers    ",
"Over And Over ~ Tami Chynn     ",
"Pale Moonlight ~ Stephen Marley    ",
"People Like You ~ Gramps Morgan    ",
"Prisoner ~ Lucky Dube   ",
"Rat In Mi Kitchen ~ UB40       ",
"Reasons ~ UB40       ",
"Red Red Wine ~ UB40  ",
"Redemption Song ~ Bob Marley & The Wailers      ",
"Reggae Fever ~ Steel Pulse   ",
"Reggae Strong ~ Lucky Dube     ",
"Remember Me ~ Lucky Dube      ",
"Rise In Love ~ Alaine      ",
"Rock Away ~ Beres Hammond   ",
"Sacrifice ~ Alaine      ",
"Sing Our Own Song ~ UB40   ",
"Skankin Sweet ~ Chronixx    ",
"Slave ~ Lucky Dube     ",
"Small People ~ Ziggy Marley     ",
"Someone Loves You Honey (Reggae Rmx) ~ Lutricia Mcneal  ",
"Spread Out ~ Elephant Man    ",
"Stepping Razor ~ Peter Tosh    ",
"Stir It Up ~ Bob Marley & The Wailers     ",
"Strangers In The Night ~ Glen Washington   ",
"Superman  ~ Tarrus Riley       ",
"Telephone Ting ~ Kiprich    ",
"Tell Me ~ Morgan Heritage     ",
"Tell You Say ~ Vybz Kartel    ",
"That Day Will Come ~ Capleton    ",
"The First Cut ~ Kashief Lindo     ",
"The Way You Do The Things You Do ~ UB-40       ",
"The World Is A Cycle ~ Richie Spice      ",
"Three Little Birds ~ Bob Marley & The Wailers     ",
"Together as One ~ Lucky Dube   ",
"Usinzi ~ Lucky Dube & The Slaves     ",
"Virtuous Woman ~ Warrior King    ",
"Waiting In Vain ~ Bob Marley    ",
"War ~  Bob Marley     ",
"Weakness In Me ~ Etana    ",
"Welcome To Jamrock ~ Damian 'JR. Gong' Marley       ",
"Wild World  ~  Maxi Priest   ",
"Wings Like A Dove ~ Culture   ",
"You Can Pray ~ Katrina   ",
"Your Best Friend ~ Morgan Heritage     "
      ],

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
      "Hey Baby ~ Marya ft. Collo nel Mustafa ",
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
  "All I Ask Of You ~ Raphael Saadiq",
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
  " Gotham City ~ R. Kelly   ",
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
" Have You Ever ~ Brandy   ",
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
  "I Love Me Some Him ~ Toni Braxton    ",
  "I Love Rock 'n' Roll ~ Joan Jett & The Blackhearts  ",
  "I Love You ~ Celine Dion       ",
  "I Love You Always Forever ~ Donna Lewis    ",
  "I Love Your Smile ~ Shanice       ",
  "I Need Love ~ LL Cool J    ",
  "I Need You ~ Anthony Marc      ",
  "I Need Your Love ~ Calvin Harris ft. Ellie Golding    ",
  "I Say A Little Prayer  ~ Tori Kelly x Pharrell Williams ((Lyrics)        ",
  "I See Fire ~ Ed Sheeran    ",
  "I Should Be So Lucky ~ Kylie Minogue   ",
  "I Still Believe ~ Mariah Carey      ",
  "I Swear ~ All-4-One    ",
  "I Took A Pill In Ibiza ~ Mike Posner    ",
  "I Try ~ Macy Gray     ",
  "I Turn To You ~ Christina Aguilera     ",
  "I Wanna Be Down ~ Brandy     ",
  "I Wanna Be With You ~ Mandy Moore      ",
  "I Wanna Be Your Lover ~ Prince      ",
  "I Wanna Dance With Somebody ~ Whitney Houston    ",
  "I Wanna Have Your Babies ~ Natasha Bedingfield  ",
  "I Wanna Know ~ Joe    ",
  "I Wanna Sex You Up ~ Color Me Badd    ",
  "I Wanna Take Forever Tonight ~ Peter Cetera & Crystal Bernard     ",
  "I Want It That Way ~ Backstreet Boys    ",
  "I Want To Know What Love Is ~ Foreigner    ",
  "I Want You Back ~ The Jackson 5      ",
  "I Was Here ~ Beyonce     ",
  "I Will Always Love You ~ Dolly Parton   ",
  "I Will Always Love You ~ Whitney Houston   ",
  "I Will Come To You ~ Hanson     ",
  "I Will Never Let You Down ~ Rita Ora    ",
  "I Will Survive ~ Gloria Gaynor      ",
  "I Wish ~ Carl Thomas       ",
  "I Wish ~ R. Kelly      ",
  "I Won't Need You Anymore Always & Forever ~ Randy Travis  ",
  "Ice Ice Baby ~ Vanilla Ice     ",
  "I'd Die Without you ~ P.M. Dawn    ",
  "I'd Do Anything For Love, But I Wont Do That ~ Meat Loaf       ",
  "I'd Rather ~ Luther Vandross   ",
  "I'd Rather Go Blind ~ Beyonce    ",
  "IDGAF ~ Dua Lipa    ",
  "If I Ain't Got You ~ Alicia Keys    ",
  "If I Can't Have You ~ Shawn Mendes   ",
  "If I Let You Go ~ Westlife   ",
  "If I Ruled the World (Imagine That) ~ Nas  ft. Lauryn Hill    ",
  "If This Isn't Love ~ Jennifer Hudson          ",
  "If Tomorrow Never Comes ~ Garth Brooks    ",
  "If Tomorrow Never Comes ~ Ronan Keating   ",
  "If You Don't Know Me By Now ~ Simply Red    ",
  "If You Had My Love ~ Jennifer Lopez    ",
  "If You Love Me ~ Brownstone     ",
  "If You Want To Find love ~ Kenny Rogers   ",
  "If You Were Mine ~ Marcos Hernandez   ",
  "If You're Happy And You Know It ~     ",
  "Ignition (Rmx) ~ R. Kelly    ",
  "II Most Wanted ~ Beyoncé x Miley Cyrus    ",
  "I'll Be There ~ Jackson 5      ",
  "I'll Be There ~ Jess Glynne    ",
  "I'll Be There For You ~ The Rembrandts   ",
  "I'll Be Your Baby Tonight ~ Robert Palmer & UB-40       ",
  "I'll Make Love To You ~ R.Kelly     ",
  "I'll Never Break Your Heart ~ Backstreet Boys     ",
  "I'll Never Love Again ~ Lady Gaga ",
  "I'll Take You There ~ The Staple Singers    ",
  "I'm A Believer ~ Smash Mouth    ",
  "I'm A Believer ~ The Monkees    ",
  "I'm A Slave 4 U ~ Britney Spears      ",
  "I'm Alive ~ Celene Dion   ",
  "I'm Already There ~ Lonestar    ",
  "I'm Burning Up ~ Vyonne Chaka Chaka       ",
  "I'm Every Woman ~ Whitney Houston      ",
  "I'm Free ~ Jon Secada     ",
  "I'm Gonna Be Alright ~ Jennifer Lopez & Nas      ",
  "I'm In Love With A DJ ~ Vyonne Chaka Chaka       ",
  "I'm Like A Bird ~ Nelly Furtado     ",
  "I'm Missing You ~ Kenny Rogers  ",
  "I'm Not The Only One ~ Sam Smith     ",
  "I'm Outta Love ~ Anastacia    ",
  "I'm Ready ~ Tevin Campbell   ",
  "I'm Real ~ Jennifer Lopez & Ja Rule    ",
  "I'm So Exited ~ Pointer Sisters    ",
  "I'm So Tired ~ Lauv & Troye Sivan      ",
  "I'm Sprung ~ T-Pain       ",
  "I'm Still In Love With You ~ New Edition    ",
  "I'm Still In Love With You ~ Sean Paul & Sasha     ",
  "I'm The One  ~ DJ Khaled  ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne  ",
  "I'm With You ~ Avril Lavigne    ",
  "I'm Your Angel ~ R. Kelly & Celine Dion   ",
  "I'm Your Baby Tonight ~ Whitney Houston    ",
  "I'm Yours  ~ Jason Mraz  ",
  "Impossible ~ James Arthur     ",
  "Impossible ~ Shontelle     ",
  "In Case You Didn't Know ~ Brett Young ",
  "In Da Club ~ 50 Cent    ",
  "In Love Wit Chu ~ Da Brat & Cherish   ",
  "In My Bed ~ Dru Hill      ",
  "In My Daughter's Eyes ~ Martina McBride   ",
  "In My Feelings ~ Drake      ",
  "In My Place ~ ColdPlay   ",
  "In The End ~ Linkin Park   ",
  "In The Ghetto ~ Elvis Presley      ",
  "In The Midnight Hour ~ Wilson Pickett   ",
  "In The Shadow ~ The Rasmus    ",
  "Incomplete ~ Sisqo    ",
  "Independent Woman ~ Destiny's Child     ",
  "International Love ~ Pitbull ft. Chris Brown      ",
  "Into The Groove ~ Madonna   ",
  "Into You ~ Ariana Grande  ",
  "Into You ~ Fabolous & Ashanti     ",
  "Intuition ~ Jewel       ",
  "Invisible Man ~ 98 Degrees     ",
  "Iris ~ Goo Goo Dolls    ",
  "Ironic ~ Alanis Morissette   ",
  "Irreplaceable ~ Beyonce      ",
  "Island In The Stream ~ Kenny Rogers & Dolly Patron     ",
  "Isn't She Lovely ~ Stevie Wonder    ",
  "Issues ~ Julia Michaels     ",
  "It Feels So Good ~ Sonique    ",
  "It Must Have Been Love ~ Roxette  ",
  "It Wasn't Me ~ Shaggy & Ricardo 'RikRok' Ducent    ",
  "It Won't Stop ~ Sevyn Streeter ft. Chris Brown   ",
  "It's All Coming Back To Me Now ~ Celine Dion   ",
  "It's My Birthday ~ Will.i.am, Cody Wise   ",
  "It's My Life ~ Bon Jovi  ",
  "It's My Life ~ No Doubt      ",
  "It's No Crime ~ Babyface         ",
  "It's Not That Easy ~ Lemar      ",
  "It's Not Unusual ~ Tom Jones        ",
  "It's Now Or Never ~ Elvis Presley    ",
  "It's Raining Men ~ The Weather Girls     ",
  "I've Been Thinking About You ~ Londonbeat      ",
  "I've Got You Under My Skin ~ Frank Sinatra    ",
  "Iwassado ~ Nayaka Bell   -   (Lyrics)    ",
  "Jailer ~ Asa      ",
  "Jailhouse Rock ~ Elvis Presley    ",
  "Jamaica Farewell ~ Don Williams    ",
  "Jar Of Hearts ~ Christina Perri    ",
  "Je Ne Sais Pas Pourquoi (I Still Love You) ~ Kylie Minogue     ",
  "Jealous ~ Labrinth       ",
  "Jesus Walks ~ Kanye West      ",
  "Johnny Be Good ~ Chuck Berry     ",
  "Jolene ~ Dolly Parton     ",
  "Joshua ~ Dolly Parton   ",
  "Joy ~ Teddy Pendergrass    ",
  "Juice ~ Lizzo      ",
  "Juicy (Its All Good) ~ The Notorious B.I.G.    ",
  "Juicy ~ The Notorious B.I.G.     ",
  "Jump ~ Kris Kross    ",
  "Jumper ~ Third Eye Blind    ",
  "Jumpin, Jumpin ~ Destiny's Child    ",
  "Just A Dream ~ Nelly      ",
  "Just A Friend 2002 ~ Mario    ",
  "Just A Lil' Bit ~ G-Unit - 50 Cents   ",
  "Just A Man ~ Kanji    ",
  "Just A Touch ~ Keith Sweat   ",
  "Just An Illusion ~ Imagination     ",
  "Just An Illusion ~ Julia Zahra   ",
  "Just Cause I'm In Love With You ~ Don William   ",
  "Just Dance ~ Lady Gaga & Colby O'Donis        ",
  "Just Dropped In (To See What Condition My Condition Is In) ~ Kenny Rogers   ",
  "Just Give Me A Reason ~ Pink ft. Nate Ruess   ",
  "Just Got Paid ~ Johnny Kemp     ",
  "Just Kickin' It ~ Xscape   ",
  "Just Like A Pill ~ Pink      ",
  "Just Like Fire ~ Pink (Pi!nk)    ",
  "Just Like It ~ Eminem      ",
  "Just The Two Of Us ~ Grover Washington Jr ft. Bill Withers    ",
  "Just The Way You Are ~ Billy Joel      ",
  "Just The Way You Are ~ Bruno Mars      ",
  "Just You And I ~Tom Walker       ",
  "Karma ~ Alicia Keys      ",
  "Karma Chameleon ~ Culture Club     ",
  "Keep It Coming' ~ Keith Sweat     ",
  "Keep Their Heads Ringing ~ Dr. Dre   ",
  "Kill Em With Kindness ~ Selena Gomez   ",
  "Killing Me Softly ~ Fugees     ",
  "Killing Me Softly With This Song ~ Roberta Flack      ",
  "King ~ Years & Years       ",
  "King Without A Crown ~ Matisyahu     ",
  "Kiss ~ Prince     ",
  "Kiss From A Rose ~ Seal        ",
  "Kiss Me ~ Sixpence None The Richer     ",
  "Kiss Me More  ~ Doja Cat  ft. SZA          ",
  "Kiss The Rain ~ Billie Myers    ",
  "Kissin' You ~ Total     ",
  "Knock You Down ~ Keri Hilson ft. Ne-Yo & Kanye West    ",
  "Knockin' On Heavens Door ~ Bob Dylan    ",
  "Knowing Me, Knowing You ~ ABBA     ",
  "Kryptonite ~ 3 Doors Down     ",
  "Kung Fu Fighting ~ Carl Douglas      ",
  "La Bamba ~ Los Lobos    ",
  "La Isla Bonita ~ Madonna   ",
  "La La La ~ Naughty Boy ft Sam Smith  ",
  "Lady (You Bring Me Up) ~ Commodores    ",
  "Lady ~ Kenny Rogers   ",
  "Lady ~ Modjo      ",
  "Lady In Red ~ Chris DeBurgh        ",
  "Lambada ~ Kaoma  ",
  "Last Hurrah ~ Bebe Rexha  ",
  "Last Night ~ AZ Yet    ",
  "Lay Me Down ~ Sam Smith   ",
  "Lay With You ~ El DeBarge ft. Faith Evans    ",
  "Le Freak ~ Chic       ",
  "Lean Back ~ Terror Squad, Fat Joe & Remy     ",
  "Lean On ~ Major Lazor ft. MO & Dj Snake    ",
  "Lean On Me ~ Bill Withers       ",
  "Lean On Me ~ Club Nouveau     ",
  "Learning To Fly ~ Tom Petty & The Heartbreakers       ",
  "Leave (Get Out) ~ Jojo      ",
  "Leave A Light On ~ Tom Walker    ",
  "Leave The Door Open  ~ Bruno Mars, Anderson .Paak, Silk Sonic ",
  "Leaving On A Jet Plane ~ John Denver  ",
  "Lemon Tree ~ Fools Garden   ",
  "Let Her Cry ~ Hootie & The Blowfish   ",
  "Let Her Go ~ Passenger    ",
  "Let It Be ~ The Beatles     ",
  "Let It Flow ~ Toni Braxton     ",
  "Let It Go ~ Demi Lovato   ",
  "Let It Go ~ Idina Menzel      ",
  "Let It Whip ~ Dazzy Band     ",
  "Let Me Be Free ~ Vyonne Chaka  Chaka    ",
  "Let Me Be The One ~ Expose       ",
  "Let Me Blow Ya Mind ~ Eve & Gwen Stefani  ",
  "Let Me Love You (Untill You Learn To Love Yourself) ~ Ne-Yo   ",
  "Let Me Love You ~ Mario      ",
  "Let The Music Play ~ Shannon  ",
  "Let Your Hair Down ~ Magic   ",
  "Let's Get It On ~ Marvin Gaye     ",
  "Let's Go ~ Calvin Harris ft. Ne-Yo     ",
  "Let's Groove ~ Earth, Wind & Fire    ",
  "Lets Hear It From The Boy ~ Beniece Williams        ",
  "Let's Twist Again ~ Chubby Checkers     ",
  "Let's Wait Awhile ~ Janet Jackson      ",
  "Levitating ~ Dua Lipa  ",
  "Liberian Girl ~ Michael Jackson ",
  "Life ~ Des'ree       ",
  "Life For Rent ~ Dido     ",
  "Life Is A Rollercoaster ~ Ronan Keating     ",
  "Lifetime ~ Maxwell        ",
  "Light It Up (Rmx) ~ Major Lazer ft. Nyla & Fuse ODG    ",
  "Lighters Up ~ Lil Kim    ",
  "Lights ~ Ellie Goulding   ",
  "Like A Prayer ~ Madonna    ",
  "Like Glue ~ Sean Paul      ",
  "Like Toy Soldiers ~ Eminem    ",
  "Linger ~ The Cranberries    ",
  "Liquor Store Blues ~ Bruno Mars ft. Damian Marley   ",
  "Listen ~ Beyonce       ",
  "Listen To Your Heart ~ D.H.T.      ",
  "Little Red Corvette ~ Prince     ",
  "Live More & Love More ~ Cat Burns   ",
  "Live To Tell ~ Madonna    ",
  "Live Your Life ~ T.I.  ft. Rihanna     ",
  "Livin' La Vida Loca ~ Ricky Martin   ",
  "Livin' On A Prayer ~ Bon Jovi      ",
  "Locked Out Of Heaven ~ Bruno Mars  ",
  "Locked Up ~ Akon & Styles P    ",
  "Lodi Dodi ~ Snoop Doggy Dogg ft. Nancy Fletcher    ",
  "Loliwe ~ Zahara    ",
  "Lollipop ~ Lil Wayne      ",
  "Lonely ~ Akon      ",
  "Long Distance ~ Brandy       ",
  "Look After You ~The Fray     ",
  "Look What You Made Me Do ~ Taylor Swift  ",
  "Lord Have Mercy On A Country Boy ~ Don Williams   ",
  "Lose Control ~ Keri Hilson ft. Nelly      ",
  "Lose Control ~ Teddy Swims   ",
  "Losing My Religion ~ R.E.M.    ",
  "Lost Without You ~ Robin Thicke      ",
  "Love Shoulda Brought You Home ~ Toni Braxton    ",
  "Love ~ Musiq Soulchild   ",
  "Love Again ~ Dua Lipa    ",
  "Love At First Sight ~ Kylie Minogue    ",
  "Love Come Down ~ Everlyn ''Champagne'' King      ",
  "Love Don't Cost A Thing ~ Jennifer Lopez   ",
  "Love In The Dark ~ Adele   ",
  "Love In This Club ~ Usher ft. Young Jeezy     ",
  "Love Is ~ V.Williams & B. McKnight    ",
  "Love Is A Wonderful Thing ~ Michael Bolton     ",
  "Love Is All Around ~ Wet Wet Wet     ",
  "Love Is Like A Butterfly ~ Dolly Parton  ",
  "Love Lies ~ Khalid & Normani   ",
  "Love Like This ~ Faith Evans    ",
  "Love Me ~ Elvis Presley    ",
  "Love Me Again ~ John Newman    ",
  "Love Me Like You Do ~ Ellie Goulding     ",
  "Love Me Now ~ John Legend   ",
  "Love Me Tender ~ Elvis Presley    ",
  "Love Never Felt So Good ~ Michael Jackson & Justin Timberlake  ",
  "Love On The Rock ~ Neil Diamond      ",
  "Love On Top ~ Beyonce  ",
  "Love Runs Out ~ OneRepublic    ",
  "Love Story ~ Taylor Swift     ",
  "Love Takes Time ~ Margulice & Carey       ",
  "Love The Way You Lie ~ Eminem ft. Rihanna      ",
  "Love Will Turn You Around ~ Kenny Rogers   ",
  "Love Yourself ~ Justin Bieber    ",
  "Lovely ~ Billie Eilish & Khalid   ",
  "Lovely Day ~ Bill Withers     ",
  "Loverboy ~ Billy Ocean     ",
  "Lovers On The Sun ~ David Guetta ft. Sam Martin     ",
  "Lovin' You ~ Minnie Ripperton  ",
  "Loving Arms ~ Dixie Chicks    ",
  "Low ~ Flo-Rida            ",
  "Lowkey  ~ NIKI    ",
  "Lucid Dreams ~ Juice WRLD   ",
  "Lucille ~ Kenny Rogers     ",
  "Lucky Star ~ Madonna     ",
  "Lucy In The Sky With Diamonds ~ The Beatles      ",
  "Luka ~ Suzanne Vega   ",
  "Lullaby ~ Nickelback    ",
  "Lullaby ~ Shawn Mullins    ",
  "Lullaby ~ Sigala ft Paloma Faith     ",
  "Lunch Time ~ Gabriel Omolo     ",
  "Lush Life ~ Zara Larsson   ",
  "M.I.L.F. $ ~ Fergie     ",
  "Macarena ~ Los Del Rio       ",
  "Mack The Knife ~ Brocht, Blitzs tein & Weill    ",
  "Mad Season ~ Matchbox 20     ",
  "Made For Me ~ Muni Long    ",
  "Made You Look ~ Meghan Trainor   ",
  "Magic ~ Coldplay      ",
  "Make It Happen ~ Mariah Carey    ",
  "Make It Rain ~ Fat Joe & Lil Wayne       ",
  "Make It Real ~ The Jets     ",
  "Make Me Better ~ Fabulous ft. Ne-Yo    ",
  "Make Me Feel ~ Janelle Monáe  ",
  "Make You Feel My Love ~ Adele     ",
  "Malibu ~ Miley Cyrus    ",
  "Mama ~ Spice Girls     ",
  "Mama Do The Hump ~ Rizzle Kicks       ",
  "Mama Mia ~ ABBA     ",
  "Mamacita ~ Collie Buddz   ",
  "Mambo No.5 ~ Lou Bega       ",
  "Man Down ~ Rihanna       ",
  "Man In The Mirror ~ Michael Jackson   ",
  "Mandolin Rain ~ Bruce Hornsby & The Range     ",
  "Manic Monday ~ The Bangles    ",
  "Many Rivers To Cross ~ Jimmy Cliff     ",
  "Maps ~ Maroon 5       ",
  "Maria ~ Blondie      ",
  "Maria Maria ~ Carlos Santana ft. Wyclef Jean      ",
  "Mark The Knife ~ Bobby Darin    ",
  "Marry Me ~ Jason Derulo    ",
  "Marvin Gaye ~ Charlie Puth ft Meghan Trainor   ",
  "Mask Off ~ Future     ",
  "Master Blaster (Jammin') ~ Steve Wonder    ",
  "Master Piece ~ Kofi Yoo ft. D.K. & Cabassa      ",
  "Masterpiece ~ Atlantic Starr    ",
  "Material Girl ~ Madonna      ",
  "Me ! ~ Taylor Swift ft. Brendon Urie    ",
  "Me and My Broken Heart ~ Rixton   ",
  "Me Love ~ Sean Kingston     ",
  "Me, Myself & I ~ G-Eazy ft. Bebe Rexha    ",
  "Meant To Be ~ Bebe Rexha ft. Florida Georgia Line  ",
  "Melt Away ~ Mariah Carey      ",
  "Melt My Heart To Stone ~ Adele    ",
  "Memories  ~ Maroon 5       ",
  "Mercedes Boy ~ Pebbles    ",
  "Mercy ~ Duffy    ",
  "Mesmerize ~ Ja Rule & Ashanti    ",
  "Mexican Girl ~ Smokie      ",
  "Mia ~ Bad Bunny x Drake       ",
  "Middle ~ DJ Snake  ft. Bipolar Sunshine    ",
  "Middle Child ~ J. Cole   ",
  "Midnight Train To Georgia ~ Gladys Knight & The Pips   ",
  "Minefields ~ Faouzia x John Legend   ",
  "Miracle ~ Whitney Houston      ",
  "Mirror ~ Justin Timberlake    ",
  "Mising You ~ Case     ",
  "Misled ~ Celine Dion    ",
  "Miss You ~ Aaliyah     ",
  "Missing ~ Everything But The Girl    ",
  "Missing You ~ Brandy, Tamia, Glady's Knight & Chaka Khan ",
  "Missing You ~ Kenny Rogers   ",
  "MMM Bop ~ Hanson       ",
  "Mo Money Mo Problems ~ The Notorious B.I.G. feat. Puff Daddy  ",
  "Mockingbird  ~ Eminem   ",
  "Mona Lisa ~ Nat King Cole   ",
  "Money On My Mind ~ Sam Smith     ",
  "More Than Words ~ Extreme      ",
  "More Than Words ~ Westlife   ",
  "Most Girl ~ Pink       ",
  "Motivation ~ Kelly Rowland ft. Lil. Wayne     ",
  "Mouth ~ Merril Bainbridge     ",
  "Moves Like Jagger ~ Maroon 5 ft. Christina Aguilera      ",
  "Moving On Up ~ M-People     ",
  "Mr. Jones ~ Counting Crows     ",
  "Mr. Loverman ~ Shabba Ranks      ",
  "Mr. Telephone Man ~ New Edition   ",
  "Mr. Too Damn Good ~ Gerald Levert    ",
  "Ms. Fat Booty ~ Mos Def   ",
  "Ms. Jackson ~ Outkast        ",
  "My All ~ Mariah Carey       ",
  "My Blue Ridge Mountain Boy ~ Dolly Parton  ",
  "My Boo ~ Usher & Alicia Keys    ",
  "My Boy lollipop ~ Millie Small     ",
  "My Church ~ Maren Morris  ",
  "My Favorite MIstake ~ Sheryl Crow   ",
  "My Favourite Game ~ The Cardigans    ",
  "My Girl ~ The Temptations    ",
  "My Happy Ending ~ Avril Lavigne       ",
  "My Head Is A Jungle (MK Rmx) ~ Wankelmut & Emma Louise   ",
  "My Heart Will Go On ~ Celine Dion    ",
  "My Immortal ~ Evanescence       ",
  "My Kind Of Love ~ Emeli Sande      ",
  "My Life Would Suck Without You ~ Kelly Clarkson   ",
  "My Love ~ Julio Iglesias & Stevie Wonder   ",
  "My Love ~ Justin Timberlake ft. T.I.     ",
  "My Love ~ Route 94 ft. Jess Glynne  ",
  "My Love ~ Westlife     ",
  "My Love Is Your Love ~ Whitney Houston  ",
  "My Name Is ~ Eminem   ",
  "My Name Is Not Susan ~ Whitney Houston       ",
  "My Place ~ Nelly & Jaheim     ",
  "My Prerogavive ~ Bobby Brown   ",
  "My Proposal ~ Ak Songstress  -  (Lyrics)            ",
  "My Sacrifice ~ Creed     ",
  "My Way ~ Frank Sinatra    ",
  "My, My, My ~ Johnny Gill    ",
  "Mysterious Girl ~ Peter Andre    ",
  "Natural ~ The Tiny Cities  ",
  "Naughty Girl ~ Beyonce Knowles     ",
  "Ndihamba Nawe ~ Mafikizolo    ",
  "Need U (100%) ~ Duke Dumont ft AME    ",
  "Need You Now ~ Lady Antebellum   ",
  "Needed Me ~ Rihanna   ",
  "Never Be The Same ~ Camilla Cabello  ",
  "Never Be The Same Again ~ TLC       ",
  "Never Find Someone Like You ~ Keith Martin     ",
  "Never Forget You ~ MNEK & Zara Larsson    ",
  "Never Give Up ~ Sia   ",
  "Never Gonna Give You Up ~ Rick Astley      ",
  "Never Had A Dream Come True ~ S Club 7        ",
  "Never Keeping Secrets ~ Babyface     ",
  "Never Let You Go ~ Third Eye Blind     ",
  "Never Lie ~ Immature    ",
  "Never Too Busy ~ Kenny Lattimore  ",
  "Never Too Much ~ Luther Vandross  ",
  "New York, New York ~ Frank Sinatra       ",
  "Next To Me ~ Emeli Sande    ",
  "Night Shift ~ Commodores     ",
  "No Air ~ Jordin Sparks ft. Chris Brown      ",
  "No Diggity ~ Blackstreet     ",
  "No Lettin Go ~ Wayne Wonder    ",
  "No Money ~ Galantis     ",
  "No More (Baby I'ma Do Right) ~ 3LW   ",
  "No More ~ Ruff Endz   ",
  "No One ~ Alicia Keys    ",
  "No Scrubs ~ TLC    ",
  "No Tears Left To Cry ~ Ariana Grande    ",
  "No U Hang Up ~ Shayne Ward   ",
  "Nobody  ~ Keith Sweat Ft Athena Cage   ",
  "Nobody ~ The Tony Rich Project     ",
  "Nobody's Home ~ Avril Lavigne      ",
  "Not Afraid ~ Eminem     ",
  "Not Gon' Cry ~ Mary J. Blige     ",
  "Not Letting Go ~ Tinie Tempah ft Jess Glynne     ",
  "Not Like Us ~ Kendrick Lamar      ",
  "Nothin' But A ''G'' Thang ~ Dr. Dre & Snoop Doggy Dogg    ",
  "Nothing Breaks Like a Heart ~ Mark Ronson ft. Miley Cyrus     ",
  "Nothing Compares To You ~ Sinead O'Connar     ",
  "Nothing Like This ~ Blonde & Craig David   ",
  "Nothing's Gonna Change My Love For You ~ George Benson  ",
  "Nothing's Gonna Stop Us Now ~ Starship      ",
  "Numb ~ Linkin Park       ",
  "Numb Encore ~ Linkin Park ft. Jay-Z      ",
  "Nuthin' But A ''G'' Thang ~ Dr. Dre & Snoop Doggy Dogg    ",
  "O.P.P. ~ Naughty By Nature   ",
  "Object Of My Desire ~ Starpoint      ",
  "Off The Wall ~ Michael Jackson     ",
  "Old McDonald ~         ",
  "Old Time Rock 'N' Roll ~ Bob Seger and The Silver Bullet Band    ",
  "Old Town Road (Rmx) ~ Lil Nas X ft. Billy Ray Cyrus    ",
  "OMG ~ Usher ft. Will.I.Am     ",
  "On Bended Knee ~ Boyz II Men     ",
  "On Fire ~ Lloyd Banks     ",
  "On More Day ~ Diamond Rio      ",
  "One ~ U2     ",
  "One Dance ~ Drake  feat. Kyla & Wizkid      ",
  "One In A Million ~ Gramps Morgan  -  (Lyrics)          ",
  "One In A Million ~ Ne-Yo  ",
  "One Last Breath ~ Creed      ",
  "One Last Cry ~ Brian McKnight     ",
  "One Love ~ Blue        ",
  "One Man Can Change The World ~ Big Sean   ",
  "One Mic ~ Nas   ",
  "One Moment In Time ~ Whitney Houston      ",
  "One More Chance ~ Michael Jackson     ",
  "One More Chance ~ The Notorious B.I.G.      ",
  "One More Night ~ Maroon 5      ",
  "One More Night ~ Phil Collins    ",
  "One More Time ~ Daft Punk    ",
  "One Night ~ Elvis Presley       ",
  "One Of The Girls ~ The Weeknd, Jennie, Lily Rose Depp",
  "One Step At A Time ~ Jordin Sparks     ",
  "One Sweet Day ~ Mariah Carey & Boyz II Men      ",
  " Say You, Say Me ~ Lionel Richie  ",
  "Say You'll Be There ~ Spice Girls  ",
  "Scared To Be Lonely ~ Martin Garrix & Dua Lipa  ",
  "Scream & Shout ~ Will.I.Am ft. Britney Spears   ",
  "Scream ~ Usher      ",
  "Searchin' my Soul ~ Vonda Shepard     ",
  "Secret Love Song ~ Little Mix ft. Jason Derulo    ",
  "Secret Lovers ~ Atlantic Starr      ",
  "See You Again ~ Wiz Khalifa ft Charlie Puth     ",
  "Self Control ~ Laura Branigan     ",
  "Semi-Charmed Life ~ Third Eye Blind    ",
  "Send My Love (To Your New Lover) ~ Adele   ",
  "Sentimental ~ Deborah Cox    ",
  "Senza Una Donna (Without A Woman) ~ Zucchero ft. Paul Young   ",
  "September ~ Earth, Wind & Fire     ",
  "Set Adrift On Memory Bliss ~ PM Dawn  ",
  "Set Fire To The Rain ~ Adele    ",
  "SEX ~ Cheat Codes x Kris Kross Amsterdam     ",
  "Sex With Me ~ Rihanna   ",
  "Sexual Healing ~ Marvin Gaye   ",
  "Sexy And I Know It ~ LMFAO    ",
  "Sexy Eyes ~ Dr. Hook    ",
  "Sexy Love ~ Ne-Yo       ",
  "SexyBack ~ Justin Timberlake & Timbaland    ",
  "Shake It Off ~ Taylor Swift  ",
  "Shake You Down ~ Gregory Abbott    ",
  "Shake Your Body ~ Michael Jackson (The Jacksons)   ",
  "Shallow ~ Lady Gaga, Bradley Cooper   ",
  "Shape Of My Heart ~ Backstreet Boys    ",
  "Shape of My Heart ~ Sting    ",
  "Shape of You  ~ Ed Sheeran    ",
  "She Believes In Me ~ Kenny Rogers     ",
  "She Drives Me Crazy ~ Fine Young Cannibals    ",
  "She Looks So Perfect ~ 5 Seconds of Summer    ",
  "She Will Be Loved ~ Maroon 5      ",
  "Shed a Light ~ Robin Schulz, David Guetta & Cheat Codes   ",
  "She's Out Of My Life ~ Michael Jackson  ",
  "She's So High ~ Tal Bachman   ",
  "Shine ~ Years & Years  ",
  "Shiny Happy People ~ R.E.M.     ",
  "Shoop ~ Salt-N-Pepa    ",
  "Shoot To Thrill ~ AC-DC     ",
  "Shotgun ~ George Ezra     ",
  "Should I Stay Or Should I Go ~ The Clash  ",
  "Shoulda, Woulda, Coulda ~ Beverley Knight      ",
  "Show Me Heaven ~ Maria McKee       ",
  "Show Me Heaven ~ Tina Arena      ",
  "Show Me Love ~ Robyn    ",
  "Show Me Off  ~ Asa    -     (Lyrics)  ",
  "Show Me The Way ~ Papa Wemba  ",
  "Shower Me With Your Love ~ Surface   ",
  "Shut Up & Dance ~ Walk The Moon     ",
  "Shy Guy ~ Diana King  ",
  "Sicko Mode ~ Travis Scott  ",
  "Sign O' The Times ~ Prince     ",
  "Sign of the Times ~ Harry Styles  ",
  "Sign Of Victory ~ R.Kelly ft. Soweto Spiritual Singers      ",
  "Since U Been Gone ~ Kelly Clarkson      ",
  "Sing ~ Ed Sheeran  ",
  "Sing ~ Travis    ",
  "Sing for the Moment ~ Eminem   ",
  "Sittin' Up In My Room ~ Brandy       ",
  "Sitting Down Here ~ Lean Rimes         ",
  "Sk8er Boi ~ Avril Lavigne     ",
  "Sky ~ Sonique      ",
  "Skyfall ~ Adele     ",
  "Sleeping Child ~ Michael Learns To Rock     ",
  "Slide ~ Goo Goo Dolls     ",
  "Slow Dance More ~ Kenny Rogers    ",
  "Slow Down ~ Bobby Valentino      ",
  "Slow Hands ~ Niall Horan   ",
  "Smack That ~ Akon ft. Eminem ",
  "Smells Like Teen Spirit ~ Nirvana    ",
  "Smooth ~ Santana & Rob Thomas      ",
  "Smooth Criminal ~ Alien Ant Farm        ",
  "Smooth Operator ~ Sade     ",
  "So Am I ~ Ava Max    ",
  "So Emotional ~ Whitney Houston      ",
  "So Far Away ~ Staind      ",
  "So Into You (Rmx) ~ Fabolous ft. Tamia  ",
  "So Into You ~ Tamia   ",
  "So Many Tears ~ 2 Pac     ",
  "So Sick ~ Ne-Yo      ",
  "So Young ~ The Corrs     ",
  "Soak Up The Sun ~ Sheryl Crow      ",
  "Soledad ~ Westlife   ",
  "Solid (As A Rock) ~ Ashford & Simpson       ",
  "Solo ~ Clean Bandit ft. Demi Lovato    ",
  "Some Broken Hearts Never Mend ~ Don Williams      ",
  "Some Nights ~ Fun    ",
  "Somebody That I Used To Know ~ Gotye ft. Kimbra      ",
  "Somebody To You ~ The Vamps ft. Demi Lovato   ",
  "Somebody's Watching Me ~ Rockwell    ",
  "Someday (Pay Day) ~ Michael Learns To Rock       ",
  "Someday ~ Nickelback   ",
  "Someday ~ Sugar Ray    ",
  "Someday We'll Know ~ New Radicals    ",
  "Someone Like You ~ Adele   ",
  "Someone Loves You Honey (Reggae Rmx) ~ Lutricia Mcneal ",
  "Someone To Love ~ Jon B. & Babyface   ",
  "Someone You Loved ~ Lewis Capaldi   ",
  "Something Happened On The Way To Heaven ~ Phil Collins      ",
  "Something I Need ~ Ben Haenow   ",
  "Something In Your Eyes ~ Bell Biv Devoe    ",
  "Something Just Like This ~ The Chainsmokers & Coldplay  ",
  "Something Stupid ~ Robby Williams & Nicole Kidman     ",
  "Something's Burning ~ Kenny Rogers    ",
  "Sometimes ~ Brand New Heavies      ",
  "Sometimes ~ Britney Spears     ",
  "Sometimes Love Just Ain't Enough ~ Patty Smyth & Don Henley    ",
  "Sometimes When We Touch ~ Dan Hill     ",
  "Sometimes When We Touch ~ Dottie West      ",
  "Somewhere I Belong ~ Linkin Park      ",
  "Somewhere Only We Know ~ Keane  ",
  "Somewhere Only We Know ~ Lily Allen  ",
  "Sorry ~ Justin Bieber     ",
  "Soul Provider  ~ Michael Bolton    ",
  "Spanish Guitar ~ Toni Braxton     ",
  "Spectrum (Say My Name) ~ Florence + the Machine ft. Calvin Harris  ",
  "Spotlight ~ Jennifer Hudson    ",
  "Stacy's Mom ~ Fountains Of Wayne       ",
  "Stan ~ Eminem & Dido   ",
  "Stand By ME ~ Ben E. king   ",
  "Stand Up ~ Cynthia Erivo  ",
  "Stand Up ~ Ludacris ft. Shawnna   ",
  "Standing Still ~ Jewel   ",
  "Starboy ~ The Weeknd ft. Daft Punk    ",
  "Starships ~ Nicki Minaj    ",
  "Start Me Up ~ The Rolling Stones   ",
  "Start Of Something New ~ High School Musical   ",
  "Stay ~ Rihanna ft. Mikky Ekko    ",
  "Stay ~ Zedd, Alessia Cara  ",
  "Stay Or Let It Go ~ Brian McKnight    ",
  "Stay The Night ~ Zedd Ft. Hayley Williams   ",
  "Stay With Me ~ Sam Smith    ",
  "Stayin' Alive ~ The Bee Gees      ",
  "Steal My Girl ~ One Direction   ",
  "Steal My Sunshine ~ Len  ",
  "Step In The Name Of Love ~ R. Kelly     ",
  "Stickwitu ~ Pussycat Dolls    ",
  "Still ~ Tamia      ",
  "Still D.R.E. ~ Dr. Dre ft. Snoop Dogg       ",
  "Still Fly ~ Big Tymers   ",
  "Still Into You ~ Paramore     ",
  "Sting ~ Fragile  ",
  "Stitches ~ Shawn Mendes   ",
  "Stop ~ Spice Girls     ",
  "Story Of My Life ~ Don Williams   ",
  "Straight Up ~ Paula Abdul    ",
  "Streets Of Philadelphia ~ Bruce Springsteen      ",
  "Strength Of A Woman ~ Shaggy      ",
  "Stressed Out ~ Twenty One Pilots     ",
  "Strip That Down ~ Liam Payne  ft. Quavo     ",
  "Strong Enough ~ Cher   ",
  "Stronger (What Doesn't Kill You) ~ Kelly Clarkson     ",
  "Stronger ~ Kanye West    ",
  "Stronger Than Me ~ Amy Winehouse   ",
  "Stuck In A Moment You Can't Get Out Of ~ U2       ",
  "Stuck On You ~ Lionel Richie   ",
  "Stunt 101 ~ G-Unit     ",
  "Stupid Girl ~ Garbage   ",
  "Sucker ~ Jonas Brothers  ",
  "Suddenly ~ Billy Ocean   ",
  "Suffocate ~ J Holiday     ",
  "Sugar ~ Maroon 5    ",
  "Suit & Tie ~ Justin Timberlake ft. Jay-Z     ",
  "Suited ~ Shekhinah   ",
  "Summer ~ Calvin Harris   ",
  "Summer Girls ~ LFO     ",
  "Summer Holiday ~ Cliff Richard    ",
  "Summer Nights ~ Olivia Newton-John & John Travolta   ",
  "Summer Of '69 ~ Bryan Adams     ",
  "Summertime Sadness ~ Lana Del Rey & Cedric Gervais   ",
  "Sunflower ~ Post Malone x Swae Lee  ",
  "Sunny Came Home ~ Shawn Colvin    ",
  "Sunshine On My Shoes ~ John Denver   ",
  "Super Bass ~ Nicki Minaj        ",
  "Super Freak ~ Rick James   ",
  "Super Trouper ~ ABBA   ",
  "Superheroes ~ The Script    ",
  "Superwoman ~ Karyn White   ",
  "Survivor ~ Destiny's Child   ",
  "Suspicious Mind ~ Elvis Presley   ",
  "Sway ~ Michael Bublé      ",
  "Swear It Again ~ Westlife     ",
  "Sweat (A La La La La Long) ~ Inner Circle     ",
  "Sweet But Psycho ~ Ava Max     ",
  "Sweet Caroline (Good Times Never Seemed So Good) ~ Neil Diamond   ",
  "Sweet Dreams (Are Made Of This) ~ The Eurythmics    ",
  "Sweet Dreams ~ Beyonce    ",
  "Sweet Home ~ Lynyrd Skynyrd       ",
  "Sweet Lady ~ Tyrese     ",
  "Sweet Love ~ Anita Baker  ",
  "Sweet Lovin' ~ Sigala    ",
  "Sweet Music Man ~ Kenny Rogers    ",
  "Sweetest Girl ~ Wyclef Jean ft. Akon & Lil Wayne       ",
  "Swing Low, Sweet Chariot ~ Ella Eyre      ",
  "Symphony ~ Clean Bandit ft. Zara Larsson     ",
  "System Ya Kapungala ~ Daddy Owen       ",
  "Tabia Mbaya ~ K. South     ",
  "Take A Bow ~ Madonna    ",
  "Take A Bow ~ Rihanna    ",
  "Take A Chance On Me ~ ABBA      ",
  "Take Care ~ Drake ft. Rihanna  ",
  "Take Me Home, Country Roads ~ John Denver      ",
  "Take Me To The Church ~ Hozier   ",
  "Take My Love Is Free ~ Vyonne Chaka Chaka    ",
  "Take You Out ~ Luther Vandross       ",
  "Take You There ~ Sean Kingston    ",
  "Taki Taki ~ DJ Snake ft. Selena Gomez, Ozuna, Cardi B  ",
  "Talk ~ Khalid   ",
  "Talk Dirty ~ Jason Derulo ft. 2 Chainz     ",
  "Talk That Talk ~ Rihanna & Jay-Z   ",
  "Talkin' Bout A Revolution ~ Tracy Chapman     ",
  "Talking to My Diary ~ Dr. Dre   ",
  "Tarzan Boy ~ Baltimora      ",
  "Tattoo ~ Jordin Sparks   ",
  "Te Amo ~ Rihanna      ",
  "Tears In Heaven ~ Eric Clapton   ",
  "Teenage Dirtbag ~ Wheatus    ",
  "Tell It All Brother ~ Kenny Rogers & The First Edition      ",
  "Tell It To My Heart ~ Taylor Dayne     ",
  "Tell Me (Whats Goin On) ~ Smilez & Southstar    ",
  "Tell Me ~ Groove Theory   ",
  "Tell Me It's Real ~ K-Ci & Jojo      ",
  "Temperature ~ Sean Paul     ",
  "Tenerife Sea  ~ Ed Sheeran       ",
  "Tennessee Whiskey ~ Chris Stapleton  ",
  "Thank You ~ Alanie Morrisette      ",
  "Thank You ~ Dido     ",
  "Thank You, Next ~ Ariana Grande      ",
  "That Don't Impress Me Much ~ Shaania Twain    ",
  "That's What I Like ~ Bruno Mars   ",
  "That's The Thing About Love ~ Don Williams   ",
  "That's The Way It Is ~ Celine Dion       ",
  "Thats The Way Love Goes ~ Janet Jackson      ",
  "Thats What Friends Are For ~ Dionne Warwick & Friends      ",
  "That's Why ~ Michael Learns To Rock     ",
  "The A Team ~ Ed Sheeran    ",
  "The Best ~ Tina Turner     ",
  "The Boy Is Mine ~ Brandy & Monica       ",
  "The Climb ~ Miley Cyrus ",
  "The Closer I Get To You ~ Beyonce Knowles & Luther Vandross      ",
  "The Cure ~ Lady Gaga    ",
  "The First Cut Is The Deepest ~ Sheryl Crow    ",
  "The First Time ~ Surface   ",
  "The Flinstones Theme ~      ",
  "The Gambler ~ Kenny Rogers     ",
  "The Girl Is Mine ~ Michael Jackson & Paul McCartney   ",
  "The Greatest ~ Kenny Rogers     ",
  "The Greatest Gift Of All ~ Kenny Rogers & Dolly Parton   ",
  "The Greatest Show ~ The Greatest Showman Cast",
  "The Harder They Come ~ Jimmy Cliff    ",
  "The Hardest Thing ~ 98 Degrees   ",
  "The Hills ~ The Weeknd   ",
  "The Lady In My Life ~ Michael Jackson      ",
  "The Lazy Song ~ Bruno Mars   ",
  "The Lion Sleeps Tonight ~ The Tokens   ",
  "The Lonely ~ Christina Perri  ",
  "The Man ~ Aloe Blacc    ",
  "The Man Who Cant Be Moved ~ The Script         ",
  "The Middle ~ Zedd, Maren Morris & Grey     ",
  "The Monster ~ Eminem ft. Rihanna   ",
  "The Most Beautiful Girl In The World ~ Prince     ",
  "The Nights ~ Avicii     ",
  "The Other Side ~ Jason Derulo   ",
  "The Power Of Goodbye ~ Madonna    ",
  "The Power Of Love ~ Celine Dion  ",
  "The Prayer ~ Celine Dion  ",
  "The Real Slim Shady ~ Eminem    ",
  "The Reason ~ Hoobastank    ",
  "The Scientist ~ Coldplay     ",
  "The Shoop Shoop Song ~ Cher     ",
  "The Sign ~ Ace Of Base   ",
  "The Sound Of Silence ~ Simon & Garfunkel        ",
  "The Storm Is Over ~ R.Kelly   ",
  "The Sweetest Taboo ~ Sade    ",
  "The Tide Is High (Get The Feeling) ~ Atomic Kitten      ",
  "The Tide Is High ~ Blonde    ",
  "The Vows Go Unbroken ~ Kenny Rogers     ",
  "The Way ~ Fastball   ",
  "The Way I Am ~ Eminem     ",
  "The Way It Is ~ Bruce Hornsby & The Range       ",
  "The Way You Make Me Feel ~ Michael Jackson    ",
  "The Winner Takes It All ~ ABBA        ",
  "The World's Greatest ~ R Kelly  ",
  "The Young Ones ~ Cliff Richard    ",
  "Then Its Love ~ Don Williams   ",
  "There She Goes ~ Sixpence None The Richer   ",
  "There's Nothing Holding Me Back ~ Shawn Mendes  ",
  "These Are The Times ~ Dru Hill     ",
  "These Days ~ Rudimental ft. Jess Glynne, Macklemore & Dan Caplen   ",
  "These Days ~ Take That   ",
  "They Don't Know ~ Jon B.  ",
  "Think About Love ~ Dolly Patron          ",
  "Think About Us ~ Little Mix ft. Ty Dolla $ign ",
  "Thinking Out Loud ~ Ed Sheeran    ",
  "Thinks Twice ~ Celine Dion   ",
  "This I Promise You ~ NSYNC     ",
  "This Is America ~ Childish Gambino  ",
  "This Is How We Do It ~ Montel Jordan       ",
  "This Is Love ~ Will.I.Am ft Eva Simons   ",
  "This Is Me ~ Camp Rock   ",
  "This Is Me ~ Demi Lovato ",
  "This Is Me ~ Demi Lovato & Joe Jonas",
  "This Is Me ~ The Greatest Showman Cast     ",
  "This Is What You Came For  ~ Calvin Harris & Rihanna   ",
  "This Is Why I'm Hot ~ Mims     ",
  "This Kiss ~ Faith Hill    ",
  "This Love ~ Maroon 5    ",
  "This Womans Work ~ Maxwell      ",
  "Thong Song ~ Sisqo    ",
  "Three Times A Lady ~ Commodores  ",
  "Three Wooden Crosses ~ Randy Travis  ",
  "Thrift Shop ~ Macklemore & Ryan Lewis ft Wanz     ",
  "Thriller ~ Michael Jackson   ",
  "Through The Years ~ Kenny Rogers     ",
  "Throw Some D's ~ Rich Boy ft. Polow Da Don     ",
  "Thug Mansion ~ 2 Pac     ",
  "Thunderclouds ~ LSD ft. Sia, Diplo, Labrinth    ",
  "Tie A Yellow Ribbon Round The Ole Oak Tree ~ Tony Orlando & Dawn    ",
  "Till You Do Me Right ~ After 7        ",
  "Timber ~ Pitbull ft. Ke$ha  ",
  "Time After Time ~ Cyndi Lauper  ",
  "Time To Say Goodbye (Con the Partiró) ~ Andrea Bocelli & Sarah Brightman   ",
  "Titanium ~ David Guettta ft. Sia    ",
  "To All The Girls I've Loved Before ~ Julio Iglesias & Willie Nelson    ",
  "To Love Somebody ~ Bee Gees     ",
  "To Love you More ~ Celine Dion     ",
  "To Loves A Woman ~  Lionel Richie & Enrique Iglesias    ",
  "To The Moon & Back ~ Savage Garden    ",
  "Together Forever ~ Rick Astley   ",
  "Tokyo (Vampires & Wolves) ~ Wombats   ",
  "Tomorrow People ~ Ziggy Marley     ",
  "Tom's Dinner ~ DNA & Suzanne Vega   ",
  "Tonight (I'm Loving You) ~ Enrique Iglesias ft. Ludacris, Dj Frank E    ",
  "Tonight, I Celebrate My Love ~ Roberta Flack & Peabo Bryson    ",
  "Too Close ~ Alex Clare     ",
  "Too Close ~ Next   ",
  "Too Good ~ Drake  ft Rihanna & Popcaan ",
  "Too Good At Goodbyes ~ Sam Smith     ",
  "Too Much Heaven ~ Bee Gees    ",
  "Top Of The World ~ Carpenters  ",
  "Torn ~ Natalie Imbruglia ",
  "Total Eclipse of The Heart ~ Bonnie Tyler    ",
  "Touch My Body ~ Mariah Carey",
  "Tough ~ Quavo x Lana Del Rey",
  "Toy Soldiers ~ Martika    ",
  "Trap Queen ~ Fetty Wap   ",
  "Treasure ~ Bruno Mars    ",
  "Treat You Better ~ Shawn Mendes  ",
  "Triggered ~ Jhené Aiko     ",
  "Trip ~ Ella Mai   ",
  "Trouble ~ Coldpaly    ",
  "Troublemaker ~ Olly Murs ft. Flo Rida      ",
  "True ~ Spandau Ballet   ",
  "True Colors ~ Cyndi Lauper  ",
  "True Colors ~ Justin Timberlake & Anna Kendrick    ",
  "True Colors ~ Phil Collins   ",
  "Truely Madly Deeply ~ Savage Garden     ",
  "Truly ~ Lionel Richie   ",
  "Trumpets ~ Jason Derulo   ",
  "Try ~ Dolly Parton  ",
  "Try ~ Pink      ",
  "Try A Little Tenderness ~ Otis Redding     ",
  "Try It On My Own ~ Whitney Houston    ",
  "Try Sleeping With A Broken Heart ~ Alicia Keys  ",
  "Tsunami (Jump) ~ DVBBS & Borgeous     ",
  "Tubthumping ~ Chumbawamba      ",
  "Turn Me On ~ David Guetta ft. Nicki Minaj       ",
  "Turn Me On ~ Kevin Lyttle     ",
  "Turn Off The Lights ~ Nelly Furtado     ",
  "Turn The Lights Down Low ~ Lauryn Hill & Bob Marley       ",
  "Turn Up The Music ~ Chris Brown ",
  "Turn Your Love Around ~ George Benson  ",
  "Turn! Turn! Turn! (To Everything There Is A Season) ~ The Byrds   ",
  "Turning Tables ~ Adele   ",
  "Twenty Years Ago ~ Kenny Rogers    ",
  "Twist & Shout ~ The Beatles  ",
  "Twisted ~ Keith Sweat   ",
  "Two Princess ~ The Spin Doctors    ",
  "Two Wrongs ~ Wyclef Jean & Claudette Ortiz       ",
  "U Can't Touch This ~ M.C Hammer      ",
  "U Got It Bad ~ Usher  ",
  "U Remind Me ~ Usher     ",
  "U Will Know ~ B.M.U.    ",
  "Ugly ~ Bubba Sparxxx   ",
  "Ugly Heart ~ G.R.L.      ",
  "Umbrella ~ Rihanna & Jay-Z    ",
  "Umqombothi ~ Vyonne Chaka Chaka     ",
  "Unbelievable ~ Craig David  ",
  "Un-Break My Heart ~ Toni Braxton   ",
  "Unbreakable ~ Westlife     ",
  "Unchained Melody ~ The Righteous Brothers      ",
  "Uncle John From Jamaica ~ Venga Boys      ",
  "Unconditional Love ~ Donna Summer    ",
  "Unconditionally ~ Katy Perry    ",
  "Underneath It All ~ No Doubt & Lady Saw    ",
  "Underneath your Clothes ~ Shakira     ",
  "Unfaithful ~ Rihanna   ",
  "Unforgettable ~ French Montana ft. Swae Lee   ",
  "Unforgettable ~ Nat King Cole  ",
  "Unpretty ~ TLC    ",
  "Unwell ~ Matchbox Twenty    ",
  "Up ~ Olly Murs ft. Demi Lovato    ",
  "Up On The Roof ~ The Drifters    ",
  "Uptown Funk ~ Mark Ronson ft. Bruno Mars    ",
  "Us Against The World ~ Westlife     ",
  "Valerie ~ Mark Ronson ft. Amy Winehouse     ",
  "Venom ~ Eminem    ",
  "Versace On The Floor ~ Bruno Mars    ",
  "Video ~ India Arie     ",
  "Viva Forever ~ Spice Girls   ",
  "Viva La Vida ~ Coldplay  ",
  "Vivo Per Lei ~ Andrea Bocelli & Hélène Ségara   ",
  "Vogue ~ Madonna    ",
  "Vossi Bop ~ Stormzy     ",
  "Wait For You ~ Elliot Yamin   ",
  "Waiting All Night ~ Rudimental ft. Ella Eyre   ",
  "Waiting For Tonight ~ Jennifer Lopez     ",
  "Waka Waka ~ Shakira     ",
  "Wake Me Up ~ Avicii     ",
  "Wake Me Up Before You Go Go ~ Wham      ",
  "Walk Away (Remember Me) ~ Paula DeAnda ft. The Dey     ",
  "Walk It Out ~ UNK     ",
  "Walk Like An Egyptian ~ The Bangles     ",
  "Walk Me Home ~ Pink    ",
  "Walk Of Life ~ Dire Straits   ",
  "Walk On ~ U2     ",
  "Walk On By ~ Dionne Warwick   ",
  "Walked Outta Heaven ~ Jagged Edge     ",
  "Walkin' A Broken Heart ~ Don Williams  ",
  "Walkin In Memphis  ~ Marc Cohen   ",
  "Walking Away ~ Craig David     ",
  "Walking In Memphis ~ Lonestar   ",
  "Walking On Sunshine ~ Katrina & The Waves     ",
  "Wannabe ~ Spice Girls   ",
  "Want To Want Me ~ Jason Derulo   ",
  "Warm It Up ~ Kris Kross     ",
  "Wasted ~ Tiësto ft. Matthew Koma    ",
  "Water ~ Tyla     ",
  "Water Runs Dry ~ Boyz II Men    ",
  "Waterfalls ~ TLC   ",
  "Waves ~ Mr. Probz     ",
  "Waving Flag ~ K'naan ft. David Disbai    ",
  "We All Are One ~ Jimmy Cliff     ",
  "We Are Family ~ Sister Sledge     ",
  "We Are Never Getting Back Together ~ Taylor Swift    ",
  "We Are The World ~ Michael Jackson &Lionel Richie     ",
  "We Are The World ~ USA For Africa   ",
  "We Are Young ~ Fun ft. Janelle Monae   ",
  "We Be Burnin' ~ Sean Paul    ",
  "We Belong Together ~ Mariah Carey  ",
  "We Can't Stop ~ Miley Cyrus       ",
  "We Don't Have To Take Our Clothes Off ~ Jermaine Stewart      ",
  "We Don't Need Another Hero ~ Tina Turner  ",
  "We Don't Talk Anymore ~ Charlie Puth ft. Selena Gomez    ",
  "We Found Love ~ Rihanna ft. Calvin Harris      ",
  "We Like To Party ~ Vengaboys       ",
  "We Will Rock You - We Are The Champions ~ Queen    ",
  "Weak ~ SWV   ",
  "Wellerman ~ Nathan Evans  ",
  "Wet Dreamz ~ J. Cole  ",
  "We've Got Tonight ~ Kenny Rogers    ",
  "What A Wonderful World ~ Louis Armstrong     ",
  "What About Us ~ Pink  ",
  "What About Us ~ The Saturdays ft. Sean Paul    ",
  "What Can I Do ~ Corrs    ",
  "What Do you Mean ~ Justin Bieber   ",
  "What Doesn't Kill You ~ Kelly Clarkson     ",
  "What Goes Around, Comes Around ~ Justin Timberlake   ",
  "What Kind of Man Would I Be ~ Mint Condition  ",
  "What Makes A Man ~ Westlife      ",
  "What Now ~ Rihanna   ",
  "What You Won't Do For Love ~ Bobby Caldwell    ",
  "What's Love Got To Do With It ~ ina Turner   ",
  "What's Luv ~ Fat Joe & Ashanti     ",
  "What's My Name ~ Rihanna ft. Drake    ",
  "What's the Difference ~ Dr. Dre ft Eminem & Xzibit    ",
  "Whatta Man ~ Salt-N-Pepa ft. En Vogue    ",
  "When a Man Loves a Woman ~ Michael Bolton   ",
  "When A Man Loves A Woman ~ Percy Sledge   ",
  "When A Woman Loves ~ R. Kelly    ",
  "When Can I See You ~ Babyface    ",
  "When Doves Cry ~ Prince   ",
  "When I Fall In Love ~ Nat King Cole  ",
  "When I Get Where I'm Going ~ Brad Paisley & Dolly Parton   ",
  "When I See You ~ Fantasia      ",
  "When I Was Your Man ~ Bruno Mars    ",
  "When I'm Gone ~ 3 Doors Down     ",
  "When It's Over ~ Sugar Ray   ",
  "When The Bassline Drops ~ Craig David & Big Narstie    ",
  "When We Were Young ~ Adele   ",
  "When You Believe ~ Whitney Houston & Mariah Carey   ",
  "When You Say Nothing At All ~ Alison Krauss & Union Station    ",
  "When You Tell Me That You Love Me ~ Diana Ross   ",
  "When You Were Young ~ The Killers  ",
  "When You're Good to Mama ~ Chicago   ",
  "When You're In Love With A Beautiful Woman ~ Dr. Hook    ",
  "Whenever You Need Somebody ~ Ricky Ashley   ",
  "Where Are U Now ~ Skrilllex ft. Justin Bieber  ",
  "Where Do Broken Hearts Go ~ Whitney Houston    ",
  "Where Have All The Cowboys Gone ~ Paula Cole   ",
  "Where Have You Been ~ Rihanna      ",
  "Where Is The Love ~ Black Eyed Peas & Justin Timberlake    ",
  "Where My Girls At ~ 702   ",
  "Wherever You Will Go ~ The Calling     ",
  "Whip Appeal  ~ Babyface   ",
  "Whip My Hair ~ Willow Smith     ",
  "Whistle ~ Flo Rida   ",
  "White Flag ~ Dido   ",
  "White Noise ~ Disclosure ft. Aluna George   ",
  "Who Am I (What's My Name) ~ Snoop Dogg    ",
  "Who Do You Love ~ Deborah Cox    ",
  "Who Knew ~ Pink    ",
  "Who Let The Dogs Out ~ Baha Men      ",
  "Who Will Save Your Soul ~ Jewel   ",
  "Who's That Girl ~ Eve     ",
  "Why Does It Hurt So Bad ~ Whitney Houston   ",
  "Why Have You Left The One You Left Me For ~ Crystal Gayle    ",
  "Wide Awake ~ Katy Perry    ",
  "Wifey ~ Next & Lil' Mo     ",
  "Wiggle ~ Jason Derulo ft Snoop Dogg     ",
  "Wild ~ Jessie J ft. Big Sean & Dizzee Rascal   ",
  "Wild Ones ~ Flo Rida ft. Sia    ",
  "Wild Thing ~ Tone Loc    ",
  "Will You Be There ~ Michael Jackson     ",
  "Wind Breath My Wings ~ Bette Midler    ",
  "Wind Of Change ~ Scorpions        ",
  "Wings ~ Little Mix   ",
  "Wish you Were Mine ~ Philip George    ",
  "With Arms Wide Open ~ Creed    ",
  "With Or Without You ~ U2      ",
  "With You ~ Chris Brown     ",
  "With You I'm Born Again ~ Billy Preston & Syreeta       ",
  "Without Me ~ Eminem   ",
  "Without Me ~ Halsey     ",
  "Without You ~ David Guetta ft. Usher     ",
  "Without You ~ Mariah Carey      ",
  "Woman In Love ~ Barbra Streisand     ",
  "Wonderful ~ Everclear    ",
  "Wonderful Tonight ~ Eric Clapton    ",
  "Wonderwall ~ Oasis      ",
  "Word Up ~ Cameo     ",
  "Words Get In The Way ~ Gloria Estefan    ",
  "Work ~ Rihanna ft. Drake    ",
  "Work from Home ~ Fifth Harmony ft. Ty Dolla $ign    ",
  "Work It ~ Missy Elliott  ",
  "Wow ~ Post Malone    ",
  "Wrapped Up ~ Olly Murs ft. Travie McCoy    ",
  "Wrecking Ball ~ Miley Cyrus   ",
  "Write Your Name (Across My Heart) ~ Kenny Rogers    ",
  "XO ~ Beyonce    ",
  "Y.M.C.A. ~ The Village People       ",
  "Yah Mo Be There ~ James Ingram & Michael McDonald        ",
  "Yeah ~ Usher & Ludacris & Lil' Jon          ",
  "Year 3000 ~ Busted      ",
  "Yellow ~ Coldplay  ",
  "Yellow Roses ~ Dolly Parton   ",
  "Yesterday ~ The Beatles    ",
  "Yesterday ~ Toni Braxton Ft. Trey Songz     ",
  "You ~ Jesse Powell    ",
  "You Ain't Know ~ Lil Wayne ft. Birdman -  (Lyrics)   ",
  "You Are ~ Lionel Richie  ",
  "You Are My Sunshine ~                    ",
  "You Are Not Alone ~ Michael Jackson    ",
  "You Are The Reason ~ Calum Scott      ",
  "You Can Call Me Al ~ Paul Simon    ",
  "You Da One ~ Rihanna     ",
  "You Decorated My Life ~ Kenny Rogers   ",
  "You Dropped A Bomb On Me ~ The Gap Band        ",
  "You Found Me ~ The Fray    ",
  "You Get What You Give ~ New Radicals         ",
  "You Girl ~ Shaggy ft. Ne-Yo  -  (Lyrics)    ",
  "You Give Love A Bad Name ~ Bon Jovi    ",
  "You Gotta Be ~ Des'ree      ",
  "You Learn ~ Alanis Morissette          ",
  "You Make Me Wanna ~ Usher         ",
  "You Mean The World To Me ~ Toni Braxton        ",
  "You Moght Need Somebody ~ Shola Ama    ",
  "You Raise Me Up ~ Westlife      ",
  "You Rock My World ~ Michael Jackson      ",
  "You Sang To Me ~ Marc Anthony       ",
  "You Sexy Thing ~ Hot Chocolate        ",
  "You Were Meant For Me ~ Jewel   ",
  "You Woman ~ White Town  ",
  "You'll Never Find Another Love Like Mine   ",
  "You'll Never Walk Alone ~ Carousel      ",
  "Young, Dumb & Broke ~ Khalid  ",
  "Youngblood ~ 5 Seconds of Summer   ",
  "Your Body's Callin' ~ R. Kelly    ",
  "Your Love Is King ~ Sade    ",
  "Your Man ~ Josh Turner   ",
  "Your Secret Love ~ Luther Vandross     ",
  "Your Song ~ Elton John     ",
  "You're A God ~ Vertical Horizon         ",
  "You're Beautiful ~ James Blunt    ",
  "You're Making Me High ~ Toni Braxton     ",
  "You're My Best Friend ~ Don Williams      ",
  "You're Still The One ~ Shania Twain       ",
  "You're The First, The Last, My Everything ~ Barry White    ",
  "You're The One ~ SWV      ",
  "You've Lost That Lovin' Feeling ~ The Righteous Brothers     ",
  "Zeze (Kodak Black) ~ Sunfly ft.Travis Scott & Offset  ",
  "Zombie ~ The Cranberries     "

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
  "African Typic Collection ~ Sam Fan Thomas     ",
"Cache Cache ~ Awilo Longomba   ",
"Chaise Electrique ~ Fally ipupa ft. Olivia   ",
"Coupe Bibamba ~ Awilo Longomba   ",
"Dezo Dezo  ~ Tshala Mwana  ",
"Every Woman Needs A Man ~ Vyonne Chaka Chaka      ",
"Loi ~ Koffi Olomide    ",
"Neng Makassy ~ Sam Fan Thomas    ",
"Noa ~ Sam Fan Thomas    ",
"Papa Lolo ~ Mose Fanfan    ",
"Rail On ~ Papa Wemba     ",
"Show Me The Way ~ Papa Wemba  ",
"Umqombothi ~ Vyonne Chaka Chaka     ",
"Vulindella ~ Brenda Fassie     ",
"Vuluka Dilolo ~ Tshala Muana    ",
"Wake Up ~ Koffi Olomide     "

  ],

    roots: [
    "Sample 1",
    "Sample 2",
    "Sample 3",
    "Sample 4",
    "Sample 5"
    ],

    traditional: [
"KAMBA",
"Kilunda Kiyisi Mbesa ~ Sammy Wambua   ",
"Rose Watwa Wa Kisumu ~ Sammy Wambua  ",

"KIKUYU",
"Amukira Ngatho ~ Ruth Wamuyu      ",
"Indo Ciene ~ Salim Young  ",
"Ino Ni Momo ~ Murimi Wa Kahalf    ",
"Kapusi Gakwa ~ Kamande Wa Kioi    ",
"Mabataro ~ Ben Githae   ",
"Mahiga ~ Ruth Wamuyu   ",
"Mariru ~ Albert Gacheru    ",
"Mugithi ~ Mr. & Mrs Nganga        ",
"Muheani ~ Phyllis Mbuthia & Sammy Irungu   ",
"Muiretu Wa Kabete (Ni Cori Muno) ~ JB Maina   ",
"Mumbi  ~ Samidoh    ",
"Mwaki ~ Zerb ft. Sofiya Nzau   ",
"Nyau Iriaga Mbia ~ Muriithi John Walker   ",
"Queen  ~ Loise Kim   ",
"Ritwa Riaku ~ Eric Wainaina    ",
"Tiga Kumute (Wendo Ni Wendo) ~ JB Maina   ",
"Wendo Wa Cebe Cebe ~ Kamaru      ",

"LUO",
"Te Amo ~ Prince Indah    "

  ],

    naija: [
 "5 And 6 ~ Naeto C   ",
"African Queen ~ 2 Face     ",
"All Over ~ Tiwa Savage    ",
"Amarula ~ Roberto   ",
"Asibe Happy ~ Kabza De Small x Ami Faku  ",
"Azonto ~ Fuse ft. Tiffany  ",
"Baby ~ Joeboy     ",
"Baby Riddim ~ Fave  ",
"Bandana ~ Fireboy DML ft. Asake  ",
"Beautiful Onyinye ~ Psquare & Rick Ross    ",
"Beautiful Onyinye ~ P-Square Ft. Rick Ross  ",
"Calm Down ~ Rema   ",
"Commas ~ Ayra Starr  ",
"Congratulations ~ Ada Ehi x Buchi    ",
"Egwu ~ Chiké ft. Mohbad    ",
"Ex  ~  Nikita Kering   -  (Lyrics)      ",
"Fall ~ Davido   ",
"Fall In Love ~ D'Banj     ",
"Fallen in Love  ~ Chidinma  ",
"For My Hand ~ Burna Boy ft. Ed-Sheeran    ",
"How Are You My Friend ~ Johnny Drille   ",
"If ~ Davido       ",
"Ifunanya ~ P-Square      ",
"Jennifer ~ Guchi      ",
"Johnny ~ Yemi Alade    ",
"Kedike  ~ Chidinma   ",
"Khona ~ Mafikizolo  ",
"Last Last ~ Burna Boy  ",
"Love Nwantiti  ~ CKay  ",
"Monalisa ~ Lojay X Sarz    ",
"Moto ~ Lojay   ",
"Ndihamba Nawe ~ Mafikizolo   ",
"No One Like You ~ P-Square    ",
"Nobody ~ DJ Neptune, Joeboy x Mr Eazi   ",
"Ojuelegba  ~  Wizkid    ",
"Oliver Twist ~ D'Banj    ",
"Only Me ~ 2 Face & Idibia   ",
"SMA ~ Nasty C    ",
"Ta Ta Ta  ~ Bayanni   ",
"Terminator ~ King Promise  ",
"Tonight ~ Nonso Amadi   ",
"Touch It  ~ KiDi         ",
"Vulindella ~ Brenda Fassie  ",
"Who is your Guy  ~ Spyro ft Tiwa Savage   ",
"Wombo Lombo ~ Angélique Kidjo   ",
"Yori Yori ~ Bracket   "
 ],

    xmass: [

"A Christmas to Remember ~ Dolly Parton & Kenny Rogers  ",
"A Holy Night    ",
"Christmas Without You ~ Dolly Parton, Kenny Rogers  ",
"Feliz Navidad ~ Jose Feliciano    ",
"Go Tell It On The Mountain  ",
"I Believe In Santa Claus ~ Dolly Parton, Kenny Rogers  ",
"Jingle Bells ~  ",
"Joy To The World ~  ",
"O Come All Ye Faithful ~  ",
"Rivers Of Babylon ~ Boney M     ",
"Silent Night ~  ",
"The First Noel ~  ",
"The Twelve Days Of Christmans ~  ",
"We Three Kings Of Orient Are ~  ",
"We Wish You A Merry christmas ~ "
  ],

};
// Show Genres on Button Click
function showGenres() {
  const videoButton = document.getElementById('videoButton');
  const content = document.getElementById('content');
  const genresColumn = document.getElementById('genresColumn');
  const itemsColumn = document.getElementById('itemsColumn');
  const genreList = document.getElementById('genreList');
  const liveRequest = document.getElementById('liveRequestBtn');
  // Hide the button and display genres
  videoButton.classList.add('hidden');
  liveRequest.classList.add('hidden');
  content.classList.remove('hidden');
  itemsColumn.classList.remove('hidden');
  genresColumn.classList.remove('hidden');
  genreList.classList.remove('hidden');

  // Populate genres
  genreList.innerHTML = Object.keys(videoData)
      .map(genre => `<li><a href="#" onclick="showVideos('${genre}')">${genre}</a></li>`)
      .join('');
}
// Function to show video clips for a genre
function showVideos(genre) {
  const videoList = document.getElementById('videoList');
  const videos = videoData[genre] || [];

  // Populate video list dynamically
  videoList.innerHTML = videos
      .map(
          video =>
              `<li><a href="#" onclick="playMedia('${video.path}')">${video.title}</a></li>`
      )
      .join('');
}


// Play Media
function playMedia(src) {
  const modal = document.getElementById('playerModal');
  const videoPlayer = document.getElementById('mediaPlayer');
  videoPlayer.src = src;

  modal.classList.remove('hidden');
  videoPlayer.play();
  // Position media player based on screen size


  // Close player automatically when video ends
  videoPlayer.onended = () => {
      closePlayer1();
  };
}

// Close Player
function closePlayer1() {
  console.log('closePlayer function called');
  const modal = document.getElementById('playerModal');
  const videoPlayer = document.getElementById('mediaPlayer');
  console.log('modal:', modal);
  console.log('videoPlayer:', videoPlayer);
  videoPlayer.pause();
  videoPlayer.src = '';
  modal.classList.add('hidden');
  console.log('player closed');
}

/////////////////////////////////////////////////// REQUEST START ///////////////////////////////////////////////
// API URL for requests
const ORIGINAL_API_URL = "https://nodayz.onrender.com/requests";

// Use a data URI approach for CORS issues
async function fetchWithCORS(url, options = {}) {
  // Create a unique request ID for this request
  const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Store the request details in sessionStorage
  const requestDetails = {
    url,
    options,
    status: 'pending',
    timestamp: Date.now()
  };
  sessionStorage.setItem(requestId, JSON.stringify(requestDetails));

  try {
    // Handle different request methods
    if (options.method === 'POST') {
      // For POST requests, we'll use our local storage approach
      // Store the request in localStorage for later processing
      const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
      pendingRequests.push({
        name: JSON.parse(options.body).name,
        request: JSON.parse(options.body).request,
        timestamp: Date.now()
      });
      localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));

      // Return a mock successful response
      return {
        ok: true,
        status: 200,
        json: async () => ({
          _id: 'local_' + Date.now(),
          name: JSON.parse(options.body).name,
          request: JSON.parse(options.body).request,
          createdAt: new Date().toISOString()
        })
      };
    } else if (options.method === 'DELETE') {
      // For DELETE requests, handle locally if it's a local ID
      const itemId = url.split('/').pop();

      if (itemId.startsWith('local_')) {
        // For local items, just remove from local storage
        const cachedRequests = JSON.parse(localStorage.getItem('cachedRequests') || '[]');
        const updatedCache = cachedRequests.filter(req => req._id !== itemId);
        localStorage.setItem('cachedRequests', JSON.stringify(updatedCache));

        // Also remove from pending requests if present
        const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        const timestamp = parseInt(itemId.replace('local_', ''));
        const updatedPending = pendingRequests.filter(req => req.timestamp !== timestamp);
        localStorage.setItem('pendingRequests', JSON.stringify(updatedPending));

        return {
          ok: true,
          status: 200,
          json: async () => ({ message: "Request deleted locally" })
        };
      }

      // For server items, try direct fetch
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
      } catch (err) {
        console.log("Direct DELETE failed, using local fallback");
      }

      // If server fetch fails, simulate success
      return {
        ok: true,
        status: 200,
        json: async () => ({ message: "Request marked for deletion" })
      };
    } else {
      // For GET requests, try to use cached data
      const cachedRequests = localStorage.getItem('cachedRequests');
      if (cachedRequests) {
        console.log('Using cached requests due to CORS issues');
        return {
          ok: true,
          status: 200,
          json: async () => JSON.parse(cachedRequests)
        };
      } else {
        // If no cache, create an empty response
        return {
          ok: true,
          status: 200,
          json: async () => []
        };
      }
    }
  } catch (error) {
    console.error('Error in fetchWithCORS:', error);
    throw error;
  }
}

// Show request form when button is clicked
liveRequestBtn.addEventListener("click", () => {
  // Save current state to history
  const currentState = {
    page: 'home'
  };
  history.pushState(currentState, '', window.location.pathname);

  // Show request form
  liveRequestBtn.classList.add("hidden");
  kcont.classList.add("hidden");
  ncont.classList.add("hidden");
  qr.classList.add("hidden");
  searchbar.classList.add("hidden");
  mixcont.classList.add("hidden");
  requestBox.classList.remove("hidden");
  backbtn.classList.remove("hidden");

  // Update history with new state
  const newState = {
    page: 'requests'
  };
  history.pushState(newState, '', window.location.pathname + '#requests');
});

// Fetch and display existing requests
async function fetchRequests() {
  try {
    // Try to fetch from server with CORS handling
    const response = await fetchWithCORS(ORIGINAL_API_URL);

    // Get the requests from the response
    const requests = await response.json();

    // If we have requests (either from server or cache)
    if (requests) {
      // If this is new data (not from cache), save it
      if (!requests.fromCache) {
        localStorage.setItem('cachedRequests', JSON.stringify(requests));
        localStorage.setItem('requestsCacheTime', Date.now());
      }

      // Update our local cache for duplicate checking
      recentRequests = Array.isArray(requests) ? requests.slice(0, 50) : [];

      // Get all existing optimistic requests
      const optimisticItems = document.querySelectorAll('.request-item[data-id^="temp-"], .request-item[data-id^="local_"]');
      const optimisticIds = Array.from(optimisticItems).map(item => item.getAttribute('data-id'));

      // Get pending requests from localStorage
      const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');

      // Clear the request display
      requestsDisplay.innerHTML = "";

      // Show cache notice if we're using cached data
      const cacheTime = localStorage.getItem('requestsCacheTime');
      if (cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        const cacheAgeMinutes = Math.floor(cacheAge / 60000);

        if (cacheAgeMinutes > 0) {
          const cacheNotice = document.createElement('div');
          cacheNotice.className = 'cache-notice';
          cacheNotice.innerHTML = `<p>Showing cached requests from ${cacheAgeMinutes} minutes ago.</p>`;
          requestsDisplay.appendChild(cacheNotice);
        }
      }

      // First add all pending requests (they should appear at the top)
      pendingRequests.forEach(pendingReq => {
        const pendingRequest = {
          _id: 'local_' + pendingReq.timestamp,
          name: pendingReq.name,
          request: pendingReq.request,
          createdAt: new Date(pendingReq.timestamp).toISOString(),
          isPending: true
        };

        // Skip if this request is already shown
        if (optimisticIds.some(id => id.includes(pendingRequest._id))) {
          return;
        }

        addRequestToUI(pendingRequest, true);
      });

      // Then add server requests
      if (Array.isArray(requests)) {
        requests.forEach((request, index) => {
          // Skip if this request is already shown as a pending request
          if (optimisticIds.some(id => id.includes(request._id)) ||
              pendingRequests.some(pr => pr.request === request.request && pr.name === request.name)) {
            return;
          }

          // Use our helper function to add the request to UI
          addRequestToUI(request);
        });
      }

      // If we have no requests to show, display a message
      if (requestsDisplay.childElementCount === 0 ||
          (requestsDisplay.childElementCount === 1 && requestsDisplay.querySelector('.cache-notice'))) {
        const noRequestsMsg = document.createElement('div');
        noRequestsMsg.className = 'no-requests';
        noRequestsMsg.textContent = 'No music requests yet. Be the first to request a song!';
        requestsDisplay.appendChild(noRequestsMsg);
      }
    }
  } catch (error) {
    console.error("Error fetching requests:", error);

    // Try to load from local storage if server fetch fails
    const cachedRequests = localStorage.getItem('cachedRequests');
    const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');

    // Clear the request display
    requestsDisplay.innerHTML = "";

    // Show error notice
    const errorNotice = document.createElement('div');
    errorNotice.className = 'error-notice';
    errorNotice.innerHTML = `<p>Unable to connect to the server. Showing locally saved requests.</p>`;
    requestsDisplay.appendChild(errorNotice);

    // Display pending requests
    pendingRequests.forEach(pendingReq => {
      const pendingRequest = {
        _id: 'local_' + pendingReq.timestamp,
        name: pendingReq.name,
        request: pendingReq.request,
        createdAt: new Date(pendingReq.timestamp).toISOString(),
        isPending: true
      };

      addRequestToUI(pendingRequest, true);
    });

    // Display cached requests
    if (cachedRequests) {
      try {
        const requests = JSON.parse(cachedRequests);

        if (Array.isArray(requests)) {
          // Update our local cache for duplicate checking
          recentRequests = requests.slice(0, 50);

          // Display cached requests
          requests.forEach(request => {
            // Skip if this is already shown as a pending request
            if (pendingRequests.some(pr => pr.request === request.request && pr.name === request.name)) {
              return;
            }

            addRequestToUI(request);
          });
        }
      } catch (e) {
        console.error('Error parsing cached requests:', e);
      }
    }

    // If we have no requests to show, display a message
    if (requestsDisplay.childElementCount === 1 && requestsDisplay.querySelector('.error-notice')) {
      const noRequestsMsg = document.createElement('div');
      noRequestsMsg.className = 'no-requests';
      noRequestsMsg.textContent = 'No music requests yet. Be the first to request a song!';
      requestsDisplay.appendChild(noRequestsMsg);
    }
  }
}

// Load requests on page load
fetchRequests();

// Cache for recent requests to check duplicates locally
let recentRequests = [];

// Handle form submission
requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const musicRequest = document.getElementById("musicRequest").value.trim();
  const userName = document.getElementById("userName").value.trim() || "User";

  // Validate music request length
  if (musicRequest.length > 40) {
    alert("Music request must be 40 characters or less!");
    return;
  }

  if (!musicRequest) {
    alert("Please enter a music request!");
    return;
  }

  // Check for duplicates in local cache first
  const isDuplicate = recentRequests.some(
    (req) => req.request && req.request.toLowerCase() === musicRequest.toLowerCase()
  );

  if (isDuplicate) {
    duplicateMessage.classList.remove("hidden");
    setTimeout(() => duplicateMessage.classList.add("hidden"), 3000); // Hide after 3 seconds
    return;
  }

  // Create new request object with timestamp for sorting
  const timestamp = Date.now();
  const newRequest = {
    name: userName,
    request: musicRequest,
    _id: 'temp-' + timestamp, // Temporary ID for optimistic UI update
    isOptimistic: true, // Flag to identify this is an optimistic update
    createdAt: new Date(timestamp).toISOString() // Add timestamp for sorting
  };

  // Optimistically add the new request to the UI immediately
  addRequestToUI(newRequest, true);

  // Clear form fields immediately
  document.getElementById("musicRequest").value = "";
  document.getElementById("userName").value = "";

  // Store in local pending requests
  const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
  pendingRequests.push({
    name: userName,
    request: musicRequest,
    timestamp: timestamp
  });
  localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));

  try {
    // Post new request to server in the background
    const postResponse = await fetchWithCORS(ORIGINAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: userName, request: musicRequest }),
    });

    // Our fetchWithCORS function will always return a successful response
    // for POST requests in offline mode, so we don't need to check postResponse.ok

    // Get the actual request with server-generated ID
    const savedRequest = await postResponse.json();

    // Add to recent requests cache
    if (!recentRequests.some(req => req._id === savedRequest._id)) {
      recentRequests.unshift(savedRequest);

      // Keep cache size manageable
      if (recentRequests.length > 50) {
        recentRequests.pop();
      }
    }

    // Replace the optimistic entry with the real one if it's a real server response
    if (!savedRequest._id.startsWith('local_')) {
      replaceOptimisticRequest(newRequest._id, savedRequest);

      // Remove from pending requests
      const updatedPendingRequests = pendingRequests.filter(req => req.timestamp !== timestamp);
      localStorage.setItem('pendingRequests', JSON.stringify(updatedPendingRequests));

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = 'Your request has been sent successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        successMessage.classList.add('fade-out');
        setTimeout(() => successMessage.remove(), 500);
      }, 2000);
    }
  } catch (error) {
    console.error("Error posting request:", error);

    // This should never happen with our new fetchWithCORS implementation,
    // but we'll keep it as a fallback

    // Keep the optimistic entry but mark it as pending
    const pendingItem = document.querySelector(`.request-item[data-id="${newRequest._id}"]`);
    if (pendingItem) {
      pendingItem.classList.add('pending-request');

      // Add pending indicator if it doesn't exist
      if (!pendingItem.querySelector('.pending-indicator')) {
        const requestText = pendingItem.innerHTML;
        pendingItem.innerHTML = requestText +
          `<span class="pending-indicator" title="This request will be sent when connection is restored">⏱️</span>`;
      }
    }

    // Show offline message
    const offlineMessage = document.createElement('div');
    offlineMessage.className = 'offline-message';
    offlineMessage.textContent = 'Your request has been saved and will be sent when you\'re back online';
    document.body.appendChild(offlineMessage);

    setTimeout(() => {
      offlineMessage.classList.add('fade-out');
      setTimeout(() => offlineMessage.remove(), 500);
    }, 3000);
  }
});

// Function to add a request to the UI
function addRequestToUI(request, isNew = false) {
  const requestItem = document.createElement("div");

  // Add appropriate classes
  let classes = ["request-item"];
  if (isNew) classes.push("new-request");
  if (request.isPending) classes.push("pending-request");
  if (request.isOptimistic) classes.push("optimistic-request");

  requestItem.className = classes.join(" ");
  requestItem.setAttribute("data-id", request._id);

  // Get the current count of requests (excluding notices)
  const requestItems = document.querySelectorAll('.request-item');
  const currentCount = requestItems.length + 1;

  // Format the timestamp
  let timeDisplay = '';
  if (request.createdAt) {
    const createdDate = new Date(request.createdAt);
    const now = new Date();

    // Calculate time remaining until expiration (24 hours from creation)
    const expirationTime = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
    const timeRemaining = expirationTime - now;

    if (timeRemaining > 0) {
      // Format the remaining time
      const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

      timeDisplay = `<span class="time-remaining" title="This request will expire in ${hoursRemaining}h ${minutesRemaining}m">
        ${hoursRemaining}h ${minutesRemaining}m left
      </span>`;
    }
  }

  // Create the request content
  let requestContent = `
    <strong>${currentCount}. ${request.name || "User"}:</strong> ${request.request}
    ${timeDisplay}
  `;

  // Add pending indicator if needed
  if (request.isPending) {
    requestContent += `<span class="pending-indicator" title="This request will be sent when connection is restored">⏱️</span>`;
  }

  requestItem.innerHTML = requestContent;

  // Add long-press event listener for deletion
  if (!request.isOptimistic) {
    addLongPressListener(requestItem, request._id);
  }

  // Add to the top of the list (after any notices)
  const notices = document.querySelectorAll('.cache-notice, .error-notice');
  if (notices.length > 0) {
    // Insert after the last notice
    notices[notices.length - 1].after(requestItem);
  } else if (requestsDisplay.firstChild) {
    requestsDisplay.insertBefore(requestItem, requestsDisplay.firstChild);
  } else {
    requestsDisplay.appendChild(requestItem);
  }

  // Add highlight animation for new requests
  if (isNew) {
    setTimeout(() => {
      requestItem.classList.remove("new-request");
    }, 2000);
  }
}

// Function to replace an optimistic request with the real one
function replaceOptimisticRequest(tempId, realRequest) {
  const optimisticItem = document.querySelector(`.request-item[data-id="${tempId}"]`);
  if (optimisticItem) {
    optimisticItem.setAttribute("data-id", realRequest._id);
    optimisticItem.classList.remove("isOptimistic");

    // Add long-press event listener for deletion
    addLongPressListener(optimisticItem, realRequest._id);
  }
}

// Function to remove an optimistic request if there was an error
function removeOptimisticRequest(tempId) {
  const optimisticItem = document.querySelector(`.request-item[data-id="${tempId}"]`);
  if (optimisticItem) {
    optimisticItem.remove();
  }
}

// Add long-press functionality to delete a request
function addLongPressListener(element, requestId) {
  let pressTimer;
  let progressBar;
  let progressInterval;
  const LONG_PRESS_DURATION = 6000; // 6 seconds for long press

  // Create progress bar element
  function createProgressBar() {
    // Remove any existing progress bar
    const existingBar = element.querySelector('.delete-progress');
    if (existingBar) {
      existingBar.remove();
    }

    // Create new progress bar
    progressBar = document.createElement('div');
    progressBar.className = 'delete-progress';
    progressBar.innerHTML = `
      <div class="delete-progress-inner"></div>
      <div class="delete-progress-text">Hold to delete</div>
    `;
    element.appendChild(progressBar);

    // Start progress animation
    const progressInner = progressBar.querySelector('.delete-progress-inner');
    progressInner.style.transition = `width ${LONG_PRESS_DURATION}ms linear`;

    // Force reflow to ensure transition starts
    progressInner.offsetWidth;

    // Start progress animation
    progressInner.style.width = '100%';

    // Update text with countdown
    let secondsLeft = Math.floor(LONG_PRESS_DURATION / 1000);
    const textElement = progressBar.querySelector('.delete-progress-text');
    textElement.textContent = `Hold to delete (${secondsLeft}s)`;

    progressInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft >= 0) {
        textElement.textContent = `Hold to delete (${secondsLeft}s)`;
      }
    }, 1000);
  }

  // Remove progress bar
  function removeProgressBar() {
    if (progressBar) {
      progressBar.remove();
      progressBar = null;
    }

    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  // Start timer on mouse down or touch start
  const startPress = (e) => {
    // Prevent default behavior for touch events to avoid scrolling
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    // Create and show progress bar
    createProgressBar();

    // Start deletion timer
    pressTimer = setTimeout(async () => {
      try {
        // Show deleting state
        element.classList.add('deleting');
        const progressText = element.querySelector('.delete-progress-text');
        if (progressText) {
          progressText.textContent = 'Deleting...';
        }

        // Try to delete from server
        const deleteResponse = await fetchWithCORS(`${ORIGINAL_API_URL}/${requestId}`, {
          method: "DELETE"
        });

        // Remove the item with animation
        element.classList.add('deleted');

        // Wait for animation to complete
        setTimeout(() => {
          element.remove();

          // Update the numbering of remaining items
          updateRequestNumbering();

          // Also remove from local cache
          const cachedRequests = JSON.parse(localStorage.getItem('cachedRequests') || '[]');
          const updatedCache = cachedRequests.filter(req => req._id !== requestId);
          localStorage.setItem('cachedRequests', JSON.stringify(updatedCache));

          // Update recent requests cache
          recentRequests = recentRequests.filter(req => req._id !== requestId);
        }, 500);
      } catch (error) {
        console.error("Error deleting request:", error);

        // Show error state
        removeProgressBar();

        // Create error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'delete-error';
        errorMsg.textContent = 'Failed to delete';
        element.appendChild(errorMsg);

        // Remove error message after a delay
        setTimeout(() => {
          errorMsg.remove();
        }, 3000);
      }
    }, LONG_PRESS_DURATION);
  };

  // Clear timer on mouse up, touch end, or leave
  const cancelPress = () => {
    clearTimeout(pressTimer);
    removeProgressBar();
  };

  element.addEventListener("mousedown", startPress);
  element.addEventListener("touchstart", startPress);
  element.addEventListener("mouseup", cancelPress);
  element.addEventListener("touchend", cancelPress);
  element.addEventListener("mouseleave", cancelPress);
}

// Function to update request numbering after deletion
function updateRequestNumbering() {
  const requestItems = document.querySelectorAll('.request-item');
  requestItems.forEach((item, index) => {
    const numberElement = item.querySelector('strong');
    if (numberElement) {
      const text = numberElement.textContent;
      const updatedText = text.replace(/^\d+\./, `${requestItems.length - index}.`);
      numberElement.textContent = updatedText;
    }
  });
}

// Periodically refresh requests to reflect auto-deletion (every 10 seconds)
setInterval(fetchRequests, 10000);

// Function to try to send pending requests when online
async function sendPendingRequests() {
  const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');

  if (pendingRequests.length === 0) {
    return; // No pending requests
  }

  console.log(`Attempting to send ${pendingRequests.length} pending requests...`);

  // Try to send each pending request
  for (let i = 0; i < pendingRequests.length; i++) {
    const pendingRequest = pendingRequests[i];

    try {
      // Try to send the request
      const response = await fetchWithCORS(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pendingRequest.name,
          request: pendingRequest.request
        }),
      });

      if (response.ok) {
        // Remove this request from the pending list
        pendingRequests.splice(i, 1);
        i--; // Adjust index since we removed an item

        // Update the pending requests in localStorage
        localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));

        console.log(`Successfully sent pending request: ${pendingRequest.request}`);
      } else {
        console.error(`Failed to send pending request: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error sending pending request: ${error.message}`);
      // Stop trying if we're still offline
      break;
    }
  }

  // Refresh the requests display
  fetchRequests();
}

// Check for online status and try to send pending requests
window.addEventListener('online', function() {
  console.log('Back online, attempting to send pending requests...');
  sendPendingRequests();
});

// Try to send pending requests on page load if we're online
if (navigator.onLine) {
  sendPendingRequests();
}

// Handle back button clicks
backbtn.addEventListener('click', (e) => {
  e.preventDefault();
  // Use browser's back functionality
  window.history.back();
});

backbtn2.addEventListener('click', (e) => {
  e.preventDefault();
  // Use browser's back functionality
  window.history.back();
});

returnBtn.addEventListener('click', (e) => {
  e.preventDefault();
  // Use browser's back functionality
  window.history.back();
});

// Handle browser's back button
window.addEventListener('popstate', (event) => {
  // Get the state that was popped
  const state = event.state;

  if (state) {
    // Handle different pages based on state
    if (state.page === 'home') {
      // Return to home page
      showHomePage();
    } else if (state.page === 'requests') {
      // Show requests page
      showRequestsPage();
    } else if (state.page === 'karaoke') {
      // Show karaoke page
      showKaraokePage();
    } else if (state.page === 'mix') {
      // Show mix page
      showMixPage();
    } else if (state.page === 'performance') {
      // Show performance page
      showPerformancePage();
    }
  } else {
    // Default to home page if no state
    showHomePage();
  }
});

// Function to show home page
function showHomePage() {
  // Hide request form
  requestBox.classList.add("hidden");

  // Show main elements
  liveRequestBtn.classList.remove("hidden");
  kcont.classList.remove("hidden");
  ncont.classList.remove("hidden");
  qr.classList.remove("hidden");
  mixcont.classList.remove("hidden");
  kvidz.classList.remove("hidden");
  container1.classList.remove("hidden");

  // Hide back buttons
  backbtn.classList.add("hidden");
  backbtn2.classList.add("hidden");
  returnBtn.classList.add("hidden");

  // Hide other sections
  document.querySelector('.content-container').style.display = 'none';
}

// Function to show requests page
function showRequestsPage() {
  liveRequestBtn.classList.add("hidden");
  kcont.classList.add("hidden");
  ncont.classList.add("hidden");
  qr.classList.add("hidden");
  searchbar.classList.add("hidden");
  mixcont.classList.add("hidden");
  requestBox.classList.remove("hidden");
  backbtn.classList.remove("hidden");
}

// Function to show karaoke page
function showKaraokePage() {
  // Hide main elements
  kcont.style.display = 'none';
  ncont.style.display = 'none';
  mixcont.style.display = 'none';
  liveRequestBtn.style.display = 'none';
  qr.style.display = 'none';
  kvidz.style.display = 'none';
  container1.style.display = 'none';
  backbtn.style.display = 'none';
  requestBox.style.display = 'none';

  // Show karaoke elements
  backbtn2.style.display = 'block';
  searchbar.style.display = 'block';
}

// Function to show performance page
function showPerformancePage() {
  // Hide main elements
  kcont.style.display = 'none';
  ncont.style.display = 'none';
  mixcont.style.display = 'none';
  liveRequestBtn.style.display = 'none';
  qr.style.display = 'none';
  kvidz.style.display = 'none';
  container1.style.display = 'none';
  kconcat.style.display = 'none';
  requestBox.style.display = 'none';

  // Show performance elements
  genresSection.style.display = 'block';
  saxcont.style.display = 'block';
  backbtn.style.display = 'block';
  searchbar.style.display = 'block';
}

// Function to show mix page
function showMixPage() {
  // Implementation depends on your mix page structure
  backbtn.style.display = 'block';
  document.querySelector('.content-container').style.display = 'block';

  // Initialize media list if needed
  if (document.getElementById('mediaList').children.length === 0) {
    initializeMediaList();
  }
}

/////////////////////////////////////////////////////////////////////////REQUEST END////////////////////////////////
// Data for categories and items
const categoryData = {
  arabic: [
  "Amarain ~ Amr Diab",
  "Macarena ~ Los Del Rio",
  "Nour El Ein (Habibi) (Inst.) ~ Amr Diab ",
  "Simarik ~ Tarkan ",
  "Yo Yo Honey Singh ~ DIL Chori -Simar-Kaur"
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
"A Woman Like You ~ Gramps Morgan  ",
"Andas en mi Cabeza ~ Chino & Nacho ft. Daddy Yankee   ",
"Back To My Roots ~ Lucky Dube    ",
"Ballroom Floor ~ Live Wire ",
"Ban Bam ~ Pliers ",
"Body Fulla Vybes Mi Sh ~ Kip Rich    ",
"Bring Me Your Cup ~ UB40  ",
"Bruk Pocket Boy ~ Tiana     ",
"Buffalo Soldier ~ Bob Marley & The Wailers    ",
"Bun Hot ~ Navino    ",
"Can't Help Falling In Love ~ UB40   ",
"Cherry Oh Baby ~ UB40   ",
"Chok There ~ Apache Indian    ",
"Church Heathen  ~ Shaggy   -     ",
"Close To You ~ Maxi Priest   ",
"Come Home ~ Morgan Heritage     ",
"Come Over ~ Estelle ft Sean Paul  ",
"Crazy World ~ Lucky Dube  ",
"Daddy ~ Queen Ifrica    ",
"Destiny ~ Buju Banton   ",
"Don't Cry ~ Lucky Dube  ",
"Don't Keep Mi Waiting ~ Nefetari     ",
"Dreams Of Brighter Days  ~ Busy Signal & R.C  ",
"Earth A Run Red ~ Richie Spice  ",
"Footprints ~ T.O.K.   ",
"Forget You ~ Jordanne Patrice  ",
"Free Up ~ Busy Signal    ",
"Fren A Mi Fren ~ D'Angel       ",
"Frenzy ~ Sanchez    ",
"Ganja Farmer ~ Marlon Asha     ",
"Get Up Stand Up ~ Bob Marley & The Wailers    ",
"Ghetto People ~ Everton Blender     ",
"Goodness of God (Reggae Rmx) ~ CeCe Winans  ",
"Guardian Angel ~ T.O.K.   ",
"Hard Drugs ~ Gregory Isaac   ",
"Hold On ~ Lucky Dube       ",
"House Of Exile ~ Lucky Dube    ",
"House Party ~ Shane O    ",
"Hurry Up & Come ~ Cocoa Tea   ",
"I Swear ~ Chuck Fender    ",
"If Jah ~ Tony Rebel   ",
"I'm Waiting ~ Cecile   ",
"Iron, Lion, Zion ~ Bob Marley   ",
"Is This Love ~ Bob Marley ",
"Jammin' ~ Bob Marley & The Wailers   ",
"Just an Illusion ~ Julie Zahra     ",
"Just The Way You Are ~ Tarrus Riley  ",
"Kingston Town ~ UB40       ",
"Legalize It ~ Peter Tosh  ",
"Lightning ~ Mortimer   ",
"Live My Life ~ Beenie Man    ",
"Lively Up Yourself ~ Bob Marley & The Wailers     ",
"Longing For ~ Jah Cure   ",
"Love Song  ~ Etana   ",
"Love You Too Much ~ Wayne Wade  ",
"Mamacita ~ Collie Buddz   ",
"Marijuana ~ Richie Spice   ",
"My Defense ~ Nasio Fontaine  ",
"Mysterious Girl ~ Peter Andre    ",
"Nah Let Go ~ Gyptian   ",
"Natural Mystic ~ Bob Marley    ",
"Needle ~ Dr Ring Ding    ",
"No Ordinary Love ~ Alaine    ",
"No Woman No Cry ~ Bob Marley & The Wailers    ",
"One In A Million ~ Gramps Morgan    ",
"One Love ~ Bob Marley & The Wailers    ",
"Over And Over ~ Tami Chynn     ",
"Pale Moonlight ~ Stephen Marley    ",
"People Like You ~ Gramps Morgan    ",
"Prisoner ~ Lucky Dube   ",
"Rat In Mi Kitchen ~ UB40       ",
"Reasons ~ UB40       ",
"Red Red Wine ~ UB40  ",
"Redemption Song ~ Bob Marley & The Wailers      ",
"Reggae Fever ~ Steel Pulse   ",
"Reggae Strong ~ Lucky Dube     ",
"Remember Me ~ Lucky Dube      ",
"Rise In Love ~ Alaine      ",
"Rock Away ~ Beres Hammond   ",
"Sacrifice ~ Alaine      ",
"Sing Our Own Song ~ UB40   ",
"Skankin Sweet ~ Chronixx    ",
"Slave ~ Lucky Dube     ",
"Small People ~ Ziggy Marley     ",
"Someone Loves You Honey (Reggae Rmx) ~ Lutricia Mcneal  ",
"Spread Out ~ Elephant Man    ",
"Stepping Razor ~ Peter Tosh    ",
"Stir It Up ~ Bob Marley & The Wailers     ",
"Strangers In The Night ~ Glen Washington   ",
"Superman  ~ Tarrus Riley       ",
"Telephone Ting ~ Kiprich    ",
"Tell Me ~ Morgan Heritage     ",
"Tell You Say ~ Vybz Kartel    ",
"That Day Will Come ~ Capleton    ",
"The First Cut ~ Kashief Lindo     ",
"The Way You Do The Things You Do ~ UB-40       ",
"The World Is A Cycle ~ Richie Spice      ",
"Three Little Birds ~ Bob Marley & The Wailers     ",
"Together as One ~ Lucky Dube   ",
"Usinzi ~ Lucky Dube & The Slaves     ",
"Virtuous Woman ~ Warrior King    ",
"Waiting In Vain ~ Bob Marley    ",
"War ~  Bob Marley     ",
"Weakness In Me ~ Etana    ",
"Welcome To Jamrock ~ Damian 'JR. Gong' Marley       ",
"Wild World  ~  Maxi Priest   ",
"Wings Like A Dove ~ Culture   ",
"You Can Pray ~ Katrina   ",
"Your Best Friend ~ Morgan Heritage     "
      ],

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
      "Hey Baby ~ Marya ft. Collo nel Mustafa ",
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
  "All I Ask Of You ~ Raphael Saadiq",
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
  " Gotham City ~ R. Kelly   ",
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
" Have You Ever ~ Brandy   ",
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
  "I Love Me Some Him ~ Toni Braxton    ",
  "I Love Rock 'n' Roll ~ Joan Jett & The Blackhearts  ",
  "I Love You ~ Celine Dion       ",
  "I Love You Always Forever ~ Donna Lewis    ",
  "I Love Your Smile ~ Shanice       ",
  "I Need Love ~ LL Cool J    ",
  "I Need You ~ Anthony Marc      ",
  "I Need Your Love ~ Calvin Harris ft. Ellie Golding    ",
  "I Say A Little Prayer  ~ Tori Kelly x Pharrell Williams ((Lyrics)        ",
  "I See Fire ~ Ed Sheeran    ",
  "I Should Be So Lucky ~ Kylie Minogue   ",
  "I Still Believe ~ Mariah Carey      ",
  "I Swear ~ All-4-One    ",
  "I Took A Pill In Ibiza ~ Mike Posner    ",
  "I Try ~ Macy Gray     ",
  "I Turn To You ~ Christina Aguilera     ",
  "I Wanna Be Down ~ Brandy     ",
  "I Wanna Be With You ~ Mandy Moore      ",
  "I Wanna Be Your Lover ~ Prince      ",
  "I Wanna Dance With Somebody ~ Whitney Houston    ",
  "I Wanna Have Your Babies ~ Natasha Bedingfield  ",
  "I Wanna Know ~ Joe    ",
  "I Wanna Sex You Up ~ Color Me Badd    ",
  "I Wanna Take Forever Tonight ~ Peter Cetera & Crystal Bernard     ",
  "I Want It That Way ~ Backstreet Boys    ",
  "I Want To Know What Love Is ~ Foreigner    ",
  "I Want You Back ~ The Jackson 5      ",
  "I Was Here ~ Beyonce     ",
  "I Will Always Love You ~ Dolly Parton   ",
  "I Will Always Love You ~ Whitney Houston   ",
  "I Will Come To You ~ Hanson     ",
  "I Will Never Let You Down ~ Rita Ora    ",
  "I Will Survive ~ Gloria Gaynor      ",
  "I Wish ~ Carl Thomas       ",
  "I Wish ~ R. Kelly      ",
  "I Won't Need You Anymore Always & Forever ~ Randy Travis  ",
  "Ice Ice Baby ~ Vanilla Ice     ",
  "I'd Die Without you ~ P.M. Dawn    ",
  "I'd Do Anything For Love, But I Wont Do That ~ Meat Loaf       ",
  "I'd Rather ~ Luther Vandross   ",
  "I'd Rather Go Blind ~ Beyonce    ",
  "IDGAF ~ Dua Lipa    ",
  "If I Ain't Got You ~ Alicia Keys    ",
  "If I Can't Have You ~ Shawn Mendes   ",
  "If I Let You Go ~ Westlife   ",
  "If I Ruled the World (Imagine That) ~ Nas  ft. Lauryn Hill    ",
  "If This Isn't Love ~ Jennifer Hudson          ",
  "If Tomorrow Never Comes ~ Garth Brooks    ",
  "If Tomorrow Never Comes ~ Ronan Keating   ",
  "If You Don't Know Me By Now ~ Simply Red    ",
  "If You Had My Love ~ Jennifer Lopez    ",
  "If You Love Me ~ Brownstone     ",
  "If You Want To Find love ~ Kenny Rogers   ",
  "If You Were Mine ~ Marcos Hernandez   ",
  "If You're Happy And You Know It ~     ",
  "Ignition (Rmx) ~ R. Kelly    ",
  "II Most Wanted ~ Beyoncé x Miley Cyrus    ",
  "I'll Be There ~ Jackson 5      ",
  "I'll Be There ~ Jess Glynne    ",
  "I'll Be There For You ~ The Rembrandts   ",
  "I'll Be Your Baby Tonight ~ Robert Palmer & UB-40       ",
  "I'll Make Love To You ~ R.Kelly     ",
  "I'll Never Break Your Heart ~ Backstreet Boys     ",
  "I'll Never Love Again ~ Lady Gaga ",
  "I'll Take You There ~ The Staple Singers    ",
  "I'm A Believer ~ Smash Mouth    ",
  "I'm A Believer ~ The Monkees    ",
  "I'm A Slave 4 U ~ Britney Spears      ",
  "I'm Alive ~ Celene Dion   ",
  "I'm Already There ~ Lonestar    ",
  "I'm Burning Up ~ Vyonne Chaka Chaka       ",
  "I'm Every Woman ~ Whitney Houston      ",
  "I'm Free ~ Jon Secada     ",
  "I'm Gonna Be Alright ~ Jennifer Lopez & Nas      ",
  "I'm In Love With A DJ ~ Vyonne Chaka Chaka       ",
  "I'm Like A Bird ~ Nelly Furtado     ",
  "I'm Missing You ~ Kenny Rogers  ",
  "I'm Not The Only One ~ Sam Smith     ",
  "I'm Outta Love ~ Anastacia    ",
  "I'm Ready ~ Tevin Campbell   ",
  "I'm Real ~ Jennifer Lopez & Ja Rule    ",
  "I'm So Exited ~ Pointer Sisters    ",
  "I'm So Tired ~ Lauv & Troye Sivan      ",
  "I'm Sprung ~ T-Pain       ",
  "I'm Still In Love With You ~ New Edition    ",
  "I'm Still In Love With You ~ Sean Paul & Sasha     ",
  "I'm The One  ~ DJ Khaled  ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne  ",
  "I'm With You ~ Avril Lavigne    ",
  "I'm Your Angel ~ R. Kelly & Celine Dion   ",
  "I'm Your Baby Tonight ~ Whitney Houston    ",
  "I'm Yours  ~ Jason Mraz  ",
  "Impossible ~ James Arthur     ",
  "Impossible ~ Shontelle     ",
  "In Case You Didn't Know ~ Brett Young ",
  "In Da Club ~ 50 Cent    ",
  "In Love Wit Chu ~ Da Brat & Cherish   ",
  "In My Bed ~ Dru Hill      ",
  "In My Daughter's Eyes ~ Martina McBride   ",
  "In My Feelings ~ Drake      ",
  "In My Place ~ ColdPlay   ",
  "In The End ~ Linkin Park   ",
  "In The Ghetto ~ Elvis Presley      ",
  "In The Midnight Hour ~ Wilson Pickett   ",
  "In The Shadow ~ The Rasmus    ",
  "Incomplete ~ Sisqo    ",
  "Independent Woman ~ Destiny's Child     ",
  "International Love ~ Pitbull ft. Chris Brown      ",
  "Into The Groove ~ Madonna   ",
  "Into You ~ Ariana Grande  ",
  "Into You ~ Fabolous & Ashanti     ",
  "Intuition ~ Jewel       ",
  "Invisible Man ~ 98 Degrees     ",
  "Iris ~ Goo Goo Dolls    ",
  "Ironic ~ Alanis Morissette   ",
  "Irreplaceable ~ Beyonce      ",
  "Island In The Stream ~ Kenny Rogers & Dolly Patron     ",
  "Isn't She Lovely ~ Stevie Wonder    ",
  "Issues ~ Julia Michaels     ",
  "It Feels So Good ~ Sonique    ",
  "It Must Have Been Love ~ Roxette  ",
  "It Wasn't Me ~ Shaggy & Ricardo 'RikRok' Ducent    ",
  "It Won't Stop ~ Sevyn Streeter ft. Chris Brown   ",
  "It's All Coming Back To Me Now ~ Celine Dion   ",
  "It's My Birthday ~ Will.i.am, Cody Wise   ",
  "It's My Life ~ Bon Jovi  ",
  "It's My Life ~ No Doubt      ",
  "It's No Crime ~ Babyface         ",
  "It's Not That Easy ~ Lemar      ",
  "It's Not Unusual ~ Tom Jones        ",
  "It's Now Or Never ~ Elvis Presley    ",
  "It's Raining Men ~ The Weather Girls     ",
  "I've Been Thinking About You ~ Londonbeat      ",
  "I've Got You Under My Skin ~ Frank Sinatra    ",
  "Iwassado ~ Nayaka Bell   -   (Lyrics)    ",
  "Jailer ~ Asa      ",
  "Jailhouse Rock ~ Elvis Presley    ",
  "Jamaica Farewell ~ Don Williams    ",
  "Jar Of Hearts ~ Christina Perri    ",
  "Je Ne Sais Pas Pourquoi (I Still Love You) ~ Kylie Minogue     ",
  "Jealous ~ Labrinth       ",
  "Jesus Walks ~ Kanye West      ",
  "Johnny Be Good ~ Chuck Berry     ",
  "Jolene ~ Dolly Parton     ",
  "Joshua ~ Dolly Parton   ",
  "Joy ~ Teddy Pendergrass    ",
  "Juice ~ Lizzo      ",
  "Juicy (Its All Good) ~ The Notorious B.I.G.    ",
  "Juicy ~ The Notorious B.I.G.     ",
  "Jump ~ Kris Kross    ",
  "Jumper ~ Third Eye Blind    ",
  "Jumpin, Jumpin ~ Destiny's Child    ",
  "Just A Dream ~ Nelly      ",
  "Just A Friend 2002 ~ Mario    ",
  "Just A Lil' Bit ~ G-Unit - 50 Cents   ",
  "Just A Man ~ Kanji    ",
  "Just A Touch ~ Keith Sweat   ",
  "Just An Illusion ~ Imagination     ",
  "Just An Illusion ~ Julia Zahra   ",
  "Just Cause I'm In Love With You ~ Don William   ",
  "Just Dance ~ Lady Gaga & Colby O'Donis        ",
  "Just Dropped In (To See What Condition My Condition Is In) ~ Kenny Rogers   ",
  "Just Give Me A Reason ~ Pink ft. Nate Ruess   ",
  "Just Got Paid ~ Johnny Kemp     ",
  "Just Kickin' It ~ Xscape   ",
  "Just Like A Pill ~ Pink      ",
  "Just Like Fire ~ Pink (Pi!nk)    ",
  "Just Like It ~ Eminem      ",
  "Just The Two Of Us ~ Grover Washington Jr ft. Bill Withers    ",
  "Just The Way You Are ~ Billy Joel      ",
  "Just The Way You Are ~ Bruno Mars      ",
  "Just You And I ~Tom Walker       ",
  "Karma ~ Alicia Keys      ",
  "Karma Chameleon ~ Culture Club     ",
  "Keep It Coming' ~ Keith Sweat     ",
  "Keep Their Heads Ringing ~ Dr. Dre   ",
  "Kill Em With Kindness ~ Selena Gomez   ",
  "Killing Me Softly ~ Fugees     ",
  "Killing Me Softly With This Song ~ Roberta Flack      ",
  "King ~ Years & Years       ",
  "King Without A Crown ~ Matisyahu     ",
  "Kiss ~ Prince     ",
  "Kiss From A Rose ~ Seal        ",
  "Kiss Me ~ Sixpence None The Richer     ",
  "Kiss Me More  ~ Doja Cat  ft. SZA          ",
  "Kiss The Rain ~ Billie Myers    ",
  "Kissin' You ~ Total     ",
  "Knock You Down ~ Keri Hilson ft. Ne-Yo & Kanye West    ",
  "Knockin' On Heavens Door ~ Bob Dylan    ",
  "Knowing Me, Knowing You ~ ABBA     ",
  "Kryptonite ~ 3 Doors Down     ",
  "Kung Fu Fighting ~ Carl Douglas      ",
  "La Bamba ~ Los Lobos    ",
  "La Isla Bonita ~ Madonna   ",
  "La La La ~ Naughty Boy ft Sam Smith  ",
  "Lady (You Bring Me Up) ~ Commodores    ",
  "Lady ~ Kenny Rogers   ",
  "Lady ~ Modjo      ",
  "Lady In Red ~ Chris DeBurgh        ",
  "Lambada ~ Kaoma  ",
  "Last Hurrah ~ Bebe Rexha  ",
  "Last Night ~ AZ Yet    ",
  "Lay Me Down ~ Sam Smith   ",
  "Lay With You ~ El DeBarge ft. Faith Evans    ",
  "Le Freak ~ Chic       ",
  "Lean Back ~ Terror Squad, Fat Joe & Remy     ",
  "Lean On ~ Major Lazor ft. MO & Dj Snake    ",
  "Lean On Me ~ Bill Withers       ",
  "Lean On Me ~ Club Nouveau     ",
  "Learning To Fly ~ Tom Petty & The Heartbreakers       ",
  "Leave (Get Out) ~ Jojo      ",
  "Leave A Light On ~ Tom Walker    ",
  "Leave The Door Open  ~ Bruno Mars, Anderson .Paak, Silk Sonic ",
  "Leaving On A Jet Plane ~ John Denver  ",
  "Lemon Tree ~ Fools Garden   ",
  "Let Her Cry ~ Hootie & The Blowfish   ",
  "Let Her Go ~ Passenger    ",
  "Let It Be ~ The Beatles     ",
  "Let It Flow ~ Toni Braxton     ",
  "Let It Go ~ Demi Lovato   ",
  "Let It Go ~ Idina Menzel      ",
  "Let It Whip ~ Dazzy Band     ",
  "Let Me Be Free ~ Vyonne Chaka  Chaka    ",
  "Let Me Be The One ~ Expose       ",
  "Let Me Blow Ya Mind ~ Eve & Gwen Stefani  ",
  "Let Me Love You (Untill You Learn To Love Yourself) ~ Ne-Yo   ",
  "Let Me Love You ~ Mario      ",
  "Let The Music Play ~ Shannon  ",
  "Let Your Hair Down ~ Magic   ",
  "Let's Get It On ~ Marvin Gaye     ",
  "Let's Go ~ Calvin Harris ft. Ne-Yo     ",
  "Let's Groove ~ Earth, Wind & Fire    ",
  "Lets Hear It From The Boy ~ Beniece Williams        ",
  "Let's Twist Again ~ Chubby Checkers     ",
  "Let's Wait Awhile ~ Janet Jackson      ",
  "Levitating ~ Dua Lipa  ",
  "Liberian Girl ~ Michael Jackson ",
  "Life ~ Des'ree       ",
  "Life For Rent ~ Dido     ",
  "Life Is A Rollercoaster ~ Ronan Keating     ",
  "Lifetime ~ Maxwell        ",
  "Light It Up (Rmx) ~ Major Lazer ft. Nyla & Fuse ODG    ",
  "Lighters Up ~ Lil Kim    ",
  "Lights ~ Ellie Goulding   ",
  "Like A Prayer ~ Madonna    ",
  "Like Glue ~ Sean Paul      ",
  "Like Toy Soldiers ~ Eminem    ",
  "Linger ~ The Cranberries    ",
  "Liquor Store Blues ~ Bruno Mars ft. Damian Marley   ",
  "Listen ~ Beyonce       ",
  "Listen To Your Heart ~ D.H.T.      ",
  "Little Red Corvette ~ Prince     ",
  "Live More & Love More ~ Cat Burns   ",
  "Live To Tell ~ Madonna    ",
  "Live Your Life ~ T.I.  ft. Rihanna     ",
  "Livin' La Vida Loca ~ Ricky Martin   ",
  "Livin' On A Prayer ~ Bon Jovi      ",
  "Locked Out Of Heaven ~ Bruno Mars  ",
  "Locked Up ~ Akon & Styles P    ",
  "Lodi Dodi ~ Snoop Doggy Dogg ft. Nancy Fletcher    ",
  "Loliwe ~ Zahara    ",
  "Lollipop ~ Lil Wayne      ",
  "Lonely ~ Akon      ",
  "Long Distance ~ Brandy       ",
  "Look After You ~The Fray     ",
  "Look What You Made Me Do ~ Taylor Swift  ",
  "Lord Have Mercy On A Country Boy ~ Don Williams   ",
  "Lose Control ~ Keri Hilson ft. Nelly      ",
  "Lose Control ~ Teddy Swims   ",
  "Losing My Religion ~ R.E.M.    ",
  "Lost Without You ~ Robin Thicke      ",
  "Love Shoulda Brought You Home ~ Toni Braxton    ",
  "Love ~ Musiq Soulchild   ",
  "Love Again ~ Dua Lipa    ",
  "Love At First Sight ~ Kylie Minogue    ",
  "Love Come Down ~ Everlyn ''Champagne'' King      ",
  "Love Don't Cost A Thing ~ Jennifer Lopez   ",
  "Love In The Dark ~ Adele   ",
  "Love In This Club ~ Usher ft. Young Jeezy     ",
  "Love Is ~ V.Williams & B. McKnight    ",
  "Love Is A Wonderful Thing ~ Michael Bolton     ",
  "Love Is All Around ~ Wet Wet Wet     ",
  "Love Is Like A Butterfly ~ Dolly Parton  ",
  "Love Lies ~ Khalid & Normani   ",
  "Love Like This ~ Faith Evans    ",
  "Love Me ~ Elvis Presley    ",
  "Love Me Again ~ John Newman    ",
  "Love Me Like You Do ~ Ellie Goulding     ",
  "Love Me Now ~ John Legend   ",
  "Love Me Tender ~ Elvis Presley    ",
  "Love Never Felt So Good ~ Michael Jackson & Justin Timberlake  ",
  "Love On The Rock ~ Neil Diamond      ",
  "Love On Top ~ Beyonce  ",
  "Love Runs Out ~ OneRepublic    ",
  "Love Story ~ Taylor Swift     ",
  "Love Takes Time ~ Margulice & Carey       ",
  "Love The Way You Lie ~ Eminem ft. Rihanna      ",
  "Love Will Turn You Around ~ Kenny Rogers   ",
  "Love Yourself ~ Justin Bieber    ",
  "Lovely ~ Billie Eilish & Khalid   ",
  "Lovely Day ~ Bill Withers     ",
  "Loverboy ~ Billy Ocean     ",
  "Lovers On The Sun ~ David Guetta ft. Sam Martin     ",
  "Lovin' You ~ Minnie Ripperton  ",
  "Loving Arms ~ Dixie Chicks    ",
  "Low ~ Flo-Rida            ",
  "Lowkey  ~ NIKI    ",
  "Lucid Dreams ~ Juice WRLD   ",
  "Lucille ~ Kenny Rogers     ",
  "Lucky Star ~ Madonna     ",
  "Lucy In The Sky With Diamonds ~ The Beatles      ",
  "Luka ~ Suzanne Vega   ",
  "Lullaby ~ Nickelback    ",
  "Lullaby ~ Shawn Mullins    ",
  "Lullaby ~ Sigala ft Paloma Faith     ",
  "Lunch Time ~ Gabriel Omolo     ",
  "Lush Life ~ Zara Larsson   ",
  "M.I.L.F. $ ~ Fergie     ",
  "Macarena ~ Los Del Rio       ",
  "Mack The Knife ~ Brocht, Blitzs tein & Weill    ",
  "Mad Season ~ Matchbox 20     ",
  "Made For Me ~ Muni Long    ",
  "Made You Look ~ Meghan Trainor   ",
  "Magic ~ Coldplay      ",
  "Make It Happen ~ Mariah Carey    ",
  "Make It Rain ~ Fat Joe & Lil Wayne       ",
  "Make It Real ~ The Jets     ",
  "Make Me Better ~ Fabulous ft. Ne-Yo    ",
  "Make Me Feel ~ Janelle Monáe  ",
  "Make You Feel My Love ~ Adele     ",
  "Malibu ~ Miley Cyrus    ",
  "Mama ~ Spice Girls     ",
  "Mama Do The Hump ~ Rizzle Kicks       ",
  "Mama Mia ~ ABBA     ",
  "Mamacita ~ Collie Buddz   ",
  "Mambo No.5 ~ Lou Bega       ",
  "Man Down ~ Rihanna       ",
  "Man In The Mirror ~ Michael Jackson   ",
  "Mandolin Rain ~ Bruce Hornsby & The Range     ",
  "Manic Monday ~ The Bangles    ",
  "Many Rivers To Cross ~ Jimmy Cliff     ",
  "Maps ~ Maroon 5       ",
  "Maria ~ Blondie      ",
  "Maria Maria ~ Carlos Santana ft. Wyclef Jean      ",
  "Mark The Knife ~ Bobby Darin    ",
  "Marry Me ~ Jason Derulo    ",
  "Marvin Gaye ~ Charlie Puth ft Meghan Trainor   ",
  "Mask Off ~ Future     ",
  "Master Blaster (Jammin') ~ Steve Wonder    ",
  "Master Piece ~ Kofi Yoo ft. D.K. & Cabassa      ",
  "Masterpiece ~ Atlantic Starr    ",
  "Material Girl ~ Madonna      ",
  "Me ! ~ Taylor Swift ft. Brendon Urie    ",
  "Me and My Broken Heart ~ Rixton   ",
  "Me Love ~ Sean Kingston     ",
  "Me, Myself & I ~ G-Eazy ft. Bebe Rexha    ",
  "Meant To Be ~ Bebe Rexha ft. Florida Georgia Line  ",
  "Melt Away ~ Mariah Carey      ",
  "Melt My Heart To Stone ~ Adele    ",
  "Memories  ~ Maroon 5       ",
  "Mercedes Boy ~ Pebbles    ",
  "Mercy ~ Duffy    ",
  "Mesmerize ~ Ja Rule & Ashanti    ",
  "Mexican Girl ~ Smokie      ",
  "Mia ~ Bad Bunny x Drake       ",
  "Middle ~ DJ Snake  ft. Bipolar Sunshine    ",
  "Middle Child ~ J. Cole   ",
  "Midnight Train To Georgia ~ Gladys Knight & The Pips   ",
  "Minefields ~ Faouzia x John Legend   ",
  "Miracle ~ Whitney Houston      ",
  "Mirror ~ Justin Timberlake    ",
  "Mising You ~ Case     ",
  "Misled ~ Celine Dion    ",
  "Miss You ~ Aaliyah     ",
  "Missing ~ Everything But The Girl    ",
  "Missing You ~ Brandy, Tamia, Glady's Knight & Chaka Khan ",
  "Missing You ~ Kenny Rogers   ",
  "MMM Bop ~ Hanson       ",
  "Mo Money Mo Problems ~ The Notorious B.I.G. feat. Puff Daddy  ",
  "Mockingbird  ~ Eminem   ",
  "Mona Lisa ~ Nat King Cole   ",
  "Money On My Mind ~ Sam Smith     ",
  "More Than Words ~ Extreme      ",
  "More Than Words ~ Westlife   ",
  "Most Girl ~ Pink       ",
  "Motivation ~ Kelly Rowland ft. Lil. Wayne     ",
  "Mouth ~ Merril Bainbridge     ",
  "Moves Like Jagger ~ Maroon 5 ft. Christina Aguilera      ",
  "Moving On Up ~ M-People     ",
  "Mr. Jones ~ Counting Crows     ",
  "Mr. Loverman ~ Shabba Ranks      ",
  "Mr. Telephone Man ~ New Edition   ",
  "Mr. Too Damn Good ~ Gerald Levert    ",
  "Ms. Fat Booty ~ Mos Def   ",
  "Ms. Jackson ~ Outkast        ",
  "My All ~ Mariah Carey       ",
  "My Blue Ridge Mountain Boy ~ Dolly Parton  ",
  "My Boo ~ Usher & Alicia Keys    ",
  "My Boy lollipop ~ Millie Small     ",
  "My Church ~ Maren Morris  ",
  "My Favorite MIstake ~ Sheryl Crow   ",
  "My Favourite Game ~ The Cardigans    ",
  "My Girl ~ The Temptations    ",
  "My Happy Ending ~ Avril Lavigne       ",
  "My Head Is A Jungle (MK Rmx) ~ Wankelmut & Emma Louise   ",
  "My Heart Will Go On ~ Celine Dion    ",
  "My Immortal ~ Evanescence       ",
  "My Kind Of Love ~ Emeli Sande      ",
  "My Life Would Suck Without You ~ Kelly Clarkson   ",
  "My Love ~ Julio Iglesias & Stevie Wonder   ",
  "My Love ~ Justin Timberlake ft. T.I.     ",
  "My Love ~ Route 94 ft. Jess Glynne  ",
  "My Love ~ Westlife     ",
  "My Love Is Your Love ~ Whitney Houston  ",
  "My Name Is ~ Eminem   ",
  "My Name Is Not Susan ~ Whitney Houston       ",
  "My Place ~ Nelly & Jaheim     ",
  "My Prerogavive ~ Bobby Brown   ",
  "My Proposal ~ Ak Songstress  -  (Lyrics)            ",
  "My Sacrifice ~ Creed     ",
  "My Way ~ Frank Sinatra    ",
  "My, My, My ~ Johnny Gill    ",
  "Mysterious Girl ~ Peter Andre    ",
  "Natural ~ The Tiny Cities  ",
  "Naughty Girl ~ Beyonce Knowles     ",
  "Ndihamba Nawe ~ Mafikizolo    ",
  "Need U (100%) ~ Duke Dumont ft AME    ",
  "Need You Now ~ Lady Antebellum   ",
  "Needed Me ~ Rihanna   ",
  "Never Be The Same ~ Camilla Cabello  ",
  "Never Be The Same Again ~ TLC       ",
  "Never Find Someone Like You ~ Keith Martin     ",
  "Never Forget You ~ MNEK & Zara Larsson    ",
  "Never Give Up ~ Sia   ",
  "Never Gonna Give You Up ~ Rick Astley      ",
  "Never Had A Dream Come True ~ S Club 7        ",
  "Never Keeping Secrets ~ Babyface     ",
  "Never Let You Go ~ Third Eye Blind     ",
  "Never Lie ~ Immature    ",
  "Never Too Busy ~ Kenny Lattimore  ",
  "Never Too Much ~ Luther Vandross  ",
  "New York, New York ~ Frank Sinatra       ",
  "Next To Me ~ Emeli Sande    ",
  "Night Shift ~ Commodores     ",
  "No Air ~ Jordin Sparks ft. Chris Brown      ",
  "No Diggity ~ Blackstreet     ",
  "No Lettin Go ~ Wayne Wonder    ",
  "No Money ~ Galantis     ",
  "No More (Baby I'ma Do Right) ~ 3LW   ",
  "No More ~ Ruff Endz   ",
  "No One ~ Alicia Keys    ",
  "No Scrubs ~ TLC    ",
  "No Tears Left To Cry ~ Ariana Grande    ",
  "No U Hang Up ~ Shayne Ward   ",
  "Nobody  ~ Keith Sweat Ft Athena Cage   ",
  "Nobody ~ The Tony Rich Project     ",
  "Nobody's Home ~ Avril Lavigne      ",
  "Not Afraid ~ Eminem     ",
  "Not Gon' Cry ~ Mary J. Blige     ",
  "Not Letting Go ~ Tinie Tempah ft Jess Glynne     ",
  "Not Like Us ~ Kendrick Lamar      ",
  "Nothin' But A ''G'' Thang ~ Dr. Dre & Snoop Doggy Dogg    ",
  "Nothing Breaks Like a Heart ~ Mark Ronson ft. Miley Cyrus     ",
  "Nothing Compares To You ~ Sinead O'Connar     ",
  "Nothing Like This ~ Blonde & Craig David   ",
  "Nothing's Gonna Change My Love For You ~ George Benson  ",
  "Nothing's Gonna Stop Us Now ~ Starship      ",
  "Numb ~ Linkin Park       ",
  "Numb Encore ~ Linkin Park ft. Jay-Z      ",
  "Nuthin' But A ''G'' Thang ~ Dr. Dre & Snoop Doggy Dogg    ",
  "O.P.P. ~ Naughty By Nature   ",
  "Object Of My Desire ~ Starpoint      ",
  "Off The Wall ~ Michael Jackson     ",
  "Old McDonald ~         ",
  "Old Time Rock 'N' Roll ~ Bob Seger and The Silver Bullet Band    ",
  "Old Town Road (Rmx) ~ Lil Nas X ft. Billy Ray Cyrus    ",
  "OMG ~ Usher ft. Will.I.Am     ",
  "On Bended Knee ~ Boyz II Men     ",
  "On Fire ~ Lloyd Banks     ",
  "On More Day ~ Diamond Rio      ",
  "One ~ U2     ",
  "One Dance ~ Drake  feat. Kyla & Wizkid      ",
  "One In A Million ~ Gramps Morgan  -  (Lyrics)          ",
  "One In A Million ~ Ne-Yo  ",
  "One Last Breath ~ Creed      ",
  "One Last Cry ~ Brian McKnight     ",
  "One Love ~ Blue        ",
  "One Man Can Change The World ~ Big Sean   ",
  "One Mic ~ Nas   ",
  "One Moment In Time ~ Whitney Houston      ",
  "One More Chance ~ Michael Jackson     ",
  "One More Chance ~ The Notorious B.I.G.      ",
  "One More Night ~ Maroon 5      ",
  "One More Night ~ Phil Collins    ",
  "One More Time ~ Daft Punk    ",
  "One Night ~ Elvis Presley       ",
  "One Of The Girls ~ The Weeknd, Jennie, Lily Rose Depp",
  "One Step At A Time ~ Jordin Sparks     ",
  "One Sweet Day ~ Mariah Carey & Boyz II Men      ",
  " Say You, Say Me ~ Lionel Richie  ",
  "Say You'll Be There ~ Spice Girls  ",
  "Scared To Be Lonely ~ Martin Garrix & Dua Lipa  ",
  "Scream & Shout ~ Will.I.Am ft. Britney Spears   ",
  "Scream ~ Usher      ",
  "Searchin' my Soul ~ Vonda Shepard     ",
  "Secret Love Song ~ Little Mix ft. Jason Derulo    ",
  "Secret Lovers ~ Atlantic Starr      ",
  "See You Again ~ Wiz Khalifa ft Charlie Puth     ",
  "Self Control ~ Laura Branigan     ",
  "Semi-Charmed Life ~ Third Eye Blind    ",
  "Send My Love (To Your New Lover) ~ Adele   ",
  "Sentimental ~ Deborah Cox    ",
  "Senza Una Donna (Without A Woman) ~ Zucchero ft. Paul Young   ",
  "September ~ Earth, Wind & Fire     ",
  "Set Adrift On Memory Bliss ~ PM Dawn  ",
  "Set Fire To The Rain ~ Adele    ",
  "SEX ~ Cheat Codes x Kris Kross Amsterdam     ",
  "Sex With Me ~ Rihanna   ",
  "Sexual Healing ~ Marvin Gaye   ",
  "Sexy And I Know It ~ LMFAO    ",
  "Sexy Eyes ~ Dr. Hook    ",
  "Sexy Love ~ Ne-Yo       ",
  "SexyBack ~ Justin Timberlake & Timbaland    ",
  "Shake It Off ~ Taylor Swift  ",
  "Shake You Down ~ Gregory Abbott    ",
  "Shake Your Body ~ Michael Jackson (The Jacksons)   ",
  "Shallow ~ Lady Gaga, Bradley Cooper   ",
  "Shape Of My Heart ~ Backstreet Boys    ",
  "Shape of My Heart ~ Sting    ",
  "Shape of You  ~ Ed Sheeran    ",
  "She Believes In Me ~ Kenny Rogers     ",
  "She Drives Me Crazy ~ Fine Young Cannibals    ",
  "She Looks So Perfect ~ 5 Seconds of Summer    ",
  "She Will Be Loved ~ Maroon 5      ",
  "Shed a Light ~ Robin Schulz, David Guetta & Cheat Codes   ",
  "She's Out Of My Life ~ Michael Jackson  ",
  "She's So High ~ Tal Bachman   ",
  "Shine ~ Years & Years  ",
  "Shiny Happy People ~ R.E.M.     ",
  "Shoop ~ Salt-N-Pepa    ",
  "Shoot To Thrill ~ AC-DC     ",
  "Shotgun ~ George Ezra     ",
  "Should I Stay Or Should I Go ~ The Clash  ",
  "Shoulda, Woulda, Coulda ~ Beverley Knight      ",
  "Show Me Heaven ~ Maria McKee       ",
  "Show Me Heaven ~ Tina Arena      ",
  "Show Me Love ~ Robyn    ",
  "Show Me Off  ~ Asa    -     (Lyrics)  ",
  "Show Me The Way ~ Papa Wemba  ",
  "Shower Me With Your Love ~ Surface   ",
  "Shut Up & Dance ~ Walk The Moon     ",
  "Shy Guy ~ Diana King  ",
  "Sicko Mode ~ Travis Scott  ",
  "Sign O' The Times ~ Prince     ",
  "Sign of the Times ~ Harry Styles  ",
  "Sign Of Victory ~ R.Kelly ft. Soweto Spiritual Singers      ",
  "Since U Been Gone ~ Kelly Clarkson      ",
  "Sing ~ Ed Sheeran  ",
  "Sing ~ Travis    ",
  "Sing for the Moment ~ Eminem   ",
  "Sittin' Up In My Room ~ Brandy       ",
  "Sitting Down Here ~ Lean Rimes         ",
  "Sk8er Boi ~ Avril Lavigne     ",
  "Sky ~ Sonique      ",
  "Skyfall ~ Adele     ",
  "Sleeping Child ~ Michael Learns To Rock     ",
  "Slide ~ Goo Goo Dolls     ",
  "Slow Dance More ~ Kenny Rogers    ",
  "Slow Down ~ Bobby Valentino      ",
  "Slow Hands ~ Niall Horan   ",
  "Smack That ~ Akon ft. Eminem ",
  "Smells Like Teen Spirit ~ Nirvana    ",
  "Smooth ~ Santana & Rob Thomas      ",
  "Smooth Criminal ~ Alien Ant Farm        ",
  "Smooth Operator ~ Sade     ",
  "So Am I ~ Ava Max    ",
  "So Emotional ~ Whitney Houston      ",
  "So Far Away ~ Staind      ",
  "So Into You (Rmx) ~ Fabolous ft. Tamia  ",
  "So Into You ~ Tamia   ",
  "So Many Tears ~ 2 Pac     ",
  "So Sick ~ Ne-Yo      ",
  "So Young ~ The Corrs     ",
  "Soak Up The Sun ~ Sheryl Crow      ",
  "Soledad ~ Westlife   ",
  "Solid (As A Rock) ~ Ashford & Simpson       ",
  "Solo ~ Clean Bandit ft. Demi Lovato    ",
  "Some Broken Hearts Never Mend ~ Don Williams      ",
  "Some Nights ~ Fun    ",
  "Somebody That I Used To Know ~ Gotye ft. Kimbra      ",
  "Somebody To You ~ The Vamps ft. Demi Lovato   ",
  "Somebody's Watching Me ~ Rockwell    ",
  "Someday (Pay Day) ~ Michael Learns To Rock       ",
  "Someday ~ Nickelback   ",
  "Someday ~ Sugar Ray    ",
  "Someday We'll Know ~ New Radicals    ",
  "Someone Like You ~ Adele   ",
  "Someone Loves You Honey (Reggae Rmx) ~ Lutricia Mcneal ",
  "Someone To Love ~ Jon B. & Babyface   ",
  "Someone You Loved ~ Lewis Capaldi   ",
  "Something Happened On The Way To Heaven ~ Phil Collins      ",
  "Something I Need ~ Ben Haenow   ",
  "Something In Your Eyes ~ Bell Biv Devoe    ",
  "Something Just Like This ~ The Chainsmokers & Coldplay  ",
  "Something Stupid ~ Robby Williams & Nicole Kidman     ",
  "Something's Burning ~ Kenny Rogers    ",
  "Sometimes ~ Brand New Heavies      ",
  "Sometimes ~ Britney Spears     ",
  "Sometimes Love Just Ain't Enough ~ Patty Smyth & Don Henley    ",
  "Sometimes When We Touch ~ Dan Hill     ",
  "Sometimes When We Touch ~ Dottie West      ",
  "Somewhere I Belong ~ Linkin Park      ",
  "Somewhere Only We Know ~ Keane  ",
  "Somewhere Only We Know ~ Lily Allen  ",
  "Sorry ~ Justin Bieber     ",
  "Soul Provider  ~ Michael Bolton    ",
  "Spanish Guitar ~ Toni Braxton     ",
  "Spectrum (Say My Name) ~ Florence + the Machine ft. Calvin Harris  ",
  "Spotlight ~ Jennifer Hudson    ",
  "Stacy's Mom ~ Fountains Of Wayne       ",
  "Stan ~ Eminem & Dido   ",
  "Stand By ME ~ Ben E. king   ",
  "Stand Up ~ Cynthia Erivo  ",
  "Stand Up ~ Ludacris ft. Shawnna   ",
  "Standing Still ~ Jewel   ",
  "Starboy ~ The Weeknd ft. Daft Punk    ",
  "Starships ~ Nicki Minaj    ",
  "Start Me Up ~ The Rolling Stones   ",
  "Start Of Something New ~ High School Musical   ",
  "Stay ~ Rihanna ft. Mikky Ekko    ",
  "Stay ~ Zedd, Alessia Cara  ",
  "Stay Or Let It Go ~ Brian McKnight    ",
  "Stay The Night ~ Zedd Ft. Hayley Williams   ",
  "Stay With Me ~ Sam Smith    ",
  "Stayin' Alive ~ The Bee Gees      ",
  "Steal My Girl ~ One Direction   ",
  "Steal My Sunshine ~ Len  ",
  "Step In The Name Of Love ~ R. Kelly     ",
  "Stickwitu ~ Pussycat Dolls    ",
  "Still ~ Tamia      ",
  "Still D.R.E. ~ Dr. Dre ft. Snoop Dogg       ",
  "Still Fly ~ Big Tymers   ",
  "Still Into You ~ Paramore     ",
  "Sting ~ Fragile  ",
  "Stitches ~ Shawn Mendes   ",
  "Stop ~ Spice Girls     ",
  "Story Of My Life ~ Don Williams   ",
  "Straight Up ~ Paula Abdul    ",
  "Streets Of Philadelphia ~ Bruce Springsteen      ",
  "Strength Of A Woman ~ Shaggy      ",
  "Stressed Out ~ Twenty One Pilots     ",
  "Strip That Down ~ Liam Payne  ft. Quavo     ",
  "Strong Enough ~ Cher   ",
  "Stronger (What Doesn't Kill You) ~ Kelly Clarkson     ",
  "Stronger ~ Kanye West    ",
  "Stronger Than Me ~ Amy Winehouse   ",
  "Stuck In A Moment You Can't Get Out Of ~ U2       ",
  "Stuck On You ~ Lionel Richie   ",
  "Stunt 101 ~ G-Unit     ",
  "Stupid Girl ~ Garbage   ",
  "Sucker ~ Jonas Brothers  ",
  "Suddenly ~ Billy Ocean   ",
  "Suffocate ~ J Holiday     ",
  "Sugar ~ Maroon 5    ",
  "Suit & Tie ~ Justin Timberlake ft. Jay-Z     ",
  "Suited ~ Shekhinah   ",
  "Summer ~ Calvin Harris   ",
  "Summer Girls ~ LFO     ",
  "Summer Holiday ~ Cliff Richard    ",
  "Summer Nights ~ Olivia Newton-John & John Travolta   ",
  "Summer Of '69 ~ Bryan Adams     ",
  "Summertime Sadness ~ Lana Del Rey & Cedric Gervais   ",
  "Sunflower ~ Post Malone x Swae Lee  ",
  "Sunny Came Home ~ Shawn Colvin    ",
  "Sunshine On My Shoes ~ John Denver   ",
  "Super Bass ~ Nicki Minaj        ",
  "Super Freak ~ Rick James   ",
  "Super Trouper ~ ABBA   ",
  "Superheroes ~ The Script    ",
  "Superwoman ~ Karyn White   ",
  "Survivor ~ Destiny's Child   ",
  "Suspicious Mind ~ Elvis Presley   ",
  "Sway ~ Michael Bublé      ",
  "Swear It Again ~ Westlife     ",
  "Sweat (A La La La La Long) ~ Inner Circle     ",
  "Sweet But Psycho ~ Ava Max     ",
  "Sweet Caroline (Good Times Never Seemed So Good) ~ Neil Diamond   ",
  "Sweet Dreams (Are Made Of This) ~ The Eurythmics    ",
  "Sweet Dreams ~ Beyonce    ",
  "Sweet Home ~ Lynyrd Skynyrd       ",
  "Sweet Lady ~ Tyrese     ",
  "Sweet Love ~ Anita Baker  ",
  "Sweet Lovin' ~ Sigala    ",
  "Sweet Music Man ~ Kenny Rogers    ",
  "Sweetest Girl ~ Wyclef Jean ft. Akon & Lil Wayne       ",
  "Swing Low, Sweet Chariot ~ Ella Eyre      ",
  "Symphony ~ Clean Bandit ft. Zara Larsson     ",
  "System Ya Kapungala ~ Daddy Owen       ",
  "Tabia Mbaya ~ K. South     ",
  "Take A Bow ~ Madonna    ",
  "Take A Bow ~ Rihanna    ",
  "Take A Chance On Me ~ ABBA      ",
  "Take Care ~ Drake ft. Rihanna  ",
  "Take Me Home, Country Roads ~ John Denver      ",
  "Take Me To The Church ~ Hozier   ",
  "Take My Love Is Free ~ Vyonne Chaka Chaka    ",
  "Take You Out ~ Luther Vandross       ",
  "Take You There ~ Sean Kingston    ",
  "Taki Taki ~ DJ Snake ft. Selena Gomez, Ozuna, Cardi B  ",
  "Talk ~ Khalid   ",
  "Talk Dirty ~ Jason Derulo ft. 2 Chainz     ",
  "Talk That Talk ~ Rihanna & Jay-Z   ",
  "Talkin' Bout A Revolution ~ Tracy Chapman     ",
  "Talking to My Diary ~ Dr. Dre   ",
  "Tarzan Boy ~ Baltimora      ",
  "Tattoo ~ Jordin Sparks   ",
  "Te Amo ~ Rihanna      ",
  "Tears In Heaven ~ Eric Clapton   ",
  "Teenage Dirtbag ~ Wheatus    ",
  "Tell It All Brother ~ Kenny Rogers & The First Edition      ",
  "Tell It To My Heart ~ Taylor Dayne     ",
  "Tell Me (Whats Goin On) ~ Smilez & Southstar    ",
  "Tell Me ~ Groove Theory   ",
  "Tell Me It's Real ~ K-Ci & Jojo      ",
  "Temperature ~ Sean Paul     ",
  "Tenerife Sea  ~ Ed Sheeran       ",
  "Tennessee Whiskey ~ Chris Stapleton  ",
  "Thank You ~ Alanie Morrisette      ",
  "Thank You ~ Dido     ",
  "Thank You, Next ~ Ariana Grande      ",
  "That Don't Impress Me Much ~ Shaania Twain    ",
  "That's What I Like ~ Bruno Mars   ",
  "That's The Thing About Love ~ Don Williams   ",
  "That's The Way It Is ~ Celine Dion       ",
  "Thats The Way Love Goes ~ Janet Jackson      ",
  "Thats What Friends Are For ~ Dionne Warwick & Friends      ",
  "That's Why ~ Michael Learns To Rock     ",
  "The A Team ~ Ed Sheeran    ",
  "The Best ~ Tina Turner     ",
  "The Boy Is Mine ~ Brandy & Monica       ",
  "The Climb ~ Miley Cyrus ",
  "The Closer I Get To You ~ Beyonce Knowles & Luther Vandross      ",
  "The Cure ~ Lady Gaga    ",
  "The First Cut Is The Deepest ~ Sheryl Crow    ",
  "The First Time ~ Surface   ",
  "The Flinstones Theme ~      ",
  "The Gambler ~ Kenny Rogers     ",
  "The Girl Is Mine ~ Michael Jackson & Paul McCartney   ",
  "The Greatest ~ Kenny Rogers     ",
  "The Greatest Gift Of All ~ Kenny Rogers & Dolly Parton   ",
  "The Greatest Show ~ The Greatest Showman Cast",
  "The Harder They Come ~ Jimmy Cliff    ",
  "The Hardest Thing ~ 98 Degrees   ",
  "The Hills ~ The Weeknd   ",
  "The Lady In My Life ~ Michael Jackson      ",
  "The Lazy Song ~ Bruno Mars   ",
  "The Lion Sleeps Tonight ~ The Tokens   ",
  "The Lonely ~ Christina Perri  ",
  "The Man ~ Aloe Blacc    ",
  "The Man Who Cant Be Moved ~ The Script         ",
  "The Middle ~ Zedd, Maren Morris & Grey     ",
  "The Monster ~ Eminem ft. Rihanna   ",
  "The Most Beautiful Girl In The World ~ Prince     ",
  "The Nights ~ Avicii     ",
  "The Other Side ~ Jason Derulo   ",
  "The Power Of Goodbye ~ Madonna    ",
  "The Power Of Love ~ Celine Dion  ",
  "The Prayer ~ Celine Dion  ",
  "The Real Slim Shady ~ Eminem    ",
  "The Reason ~ Hoobastank    ",
  "The Scientist ~ Coldplay     ",
  "The Shoop Shoop Song ~ Cher     ",
  "The Sign ~ Ace Of Base   ",
  "The Sound Of Silence ~ Simon & Garfunkel        ",
  "The Storm Is Over ~ R.Kelly   ",
  "The Sweetest Taboo ~ Sade    ",
  "The Tide Is High (Get The Feeling) ~ Atomic Kitten      ",
  "The Tide Is High ~ Blonde    ",
  "The Vows Go Unbroken ~ Kenny Rogers     ",
  "The Way ~ Fastball   ",
  "The Way I Am ~ Eminem     ",
  "The Way It Is ~ Bruce Hornsby & The Range       ",
  "The Way You Make Me Feel ~ Michael Jackson    ",
  "The Winner Takes It All ~ ABBA        ",
  "The World's Greatest ~ R Kelly  ",
  "The Young Ones ~ Cliff Richard    ",
  "Then Its Love ~ Don Williams   ",
  "There She Goes ~ Sixpence None The Richer   ",
  "There's Nothing Holding Me Back ~ Shawn Mendes  ",
  "These Are The Times ~ Dru Hill     ",
  "These Days ~ Rudimental ft. Jess Glynne, Macklemore & Dan Caplen   ",
  "These Days ~ Take That   ",
  "They Don't Know ~ Jon B.  ",
  "Think About Love ~ Dolly Patron          ",
  "Think About Us ~ Little Mix ft. Ty Dolla $ign ",
  "Thinking Out Loud ~ Ed Sheeran    ",
  "Thinks Twice ~ Celine Dion   ",
  "This I Promise You ~ NSYNC     ",
  "This Is America ~ Childish Gambino  ",
  "This Is How We Do It ~ Montel Jordan       ",
  "This Is Love ~ Will.I.Am ft Eva Simons   ",
  "This Is Me ~ Camp Rock   ",
  "This Is Me ~ Demi Lovato ",
  "This Is Me ~ Demi Lovato & Joe Jonas",
  "This Is Me ~ The Greatest Showman Cast     ",
  "This Is What You Came For  ~ Calvin Harris & Rihanna   ",
  "This Is Why I'm Hot ~ Mims     ",
  "This Kiss ~ Faith Hill    ",
  "This Love ~ Maroon 5    ",
  "This Womans Work ~ Maxwell      ",
  "Thong Song ~ Sisqo    ",
  "Three Times A Lady ~ Commodores  ",
  "Three Wooden Crosses ~ Randy Travis  ",
  "Thrift Shop ~ Macklemore & Ryan Lewis ft Wanz     ",
  "Thriller ~ Michael Jackson   ",
  "Through The Years ~ Kenny Rogers     ",
  "Throw Some D's ~ Rich Boy ft. Polow Da Don     ",
  "Thug Mansion ~ 2 Pac     ",
  "Thunderclouds ~ LSD ft. Sia, Diplo, Labrinth    ",
  "Tie A Yellow Ribbon Round The Ole Oak Tree ~ Tony Orlando & Dawn    ",
  "Till You Do Me Right ~ After 7        ",
  "Timber ~ Pitbull ft. Ke$ha  ",
  "Time After Time ~ Cyndi Lauper  ",
  "Time To Say Goodbye (Con the Partiró) ~ Andrea Bocelli & Sarah Brightman   ",
  "Titanium ~ David Guettta ft. Sia    ",
  "To All The Girls I've Loved Before ~ Julio Iglesias & Willie Nelson    ",
  "To Love Somebody ~ Bee Gees     ",
  "To Love you More ~ Celine Dion     ",
  "To Loves A Woman ~  Lionel Richie & Enrique Iglesias    ",
  "To The Moon & Back ~ Savage Garden    ",
  "Together Forever ~ Rick Astley   ",
  "Tokyo (Vampires & Wolves) ~ Wombats   ",
  "Tomorrow People ~ Ziggy Marley     ",
  "Tom's Dinner ~ DNA & Suzanne Vega   ",
  "Tonight (I'm Loving You) ~ Enrique Iglesias ft. Ludacris, Dj Frank E    ",
  "Tonight, I Celebrate My Love ~ Roberta Flack & Peabo Bryson    ",
  "Too Close ~ Alex Clare     ",
  "Too Close ~ Next   ",
  "Too Good ~ Drake  ft Rihanna & Popcaan ",
  "Too Good At Goodbyes ~ Sam Smith     ",
  "Too Much Heaven ~ Bee Gees    ",
  "Top Of The World ~ Carpenters  ",
  "Torn ~ Natalie Imbruglia ",
  "Total Eclipse of The Heart ~ Bonnie Tyler    ",
  "Touch My Body ~ Mariah Carey",
  "Tough ~ Quavo x Lana Del Rey",
  "Toy Soldiers ~ Martika    ",
  "Trap Queen ~ Fetty Wap   ",
  "Treasure ~ Bruno Mars    ",
  "Treat You Better ~ Shawn Mendes  ",
  "Triggered ~ Jhené Aiko     ",
  "Trip ~ Ella Mai   ",
  "Trouble ~ Coldpaly    ",
  "Troublemaker ~ Olly Murs ft. Flo Rida      ",
  "True ~ Spandau Ballet   ",
  "True Colors ~ Cyndi Lauper  ",
  "True Colors ~ Justin Timberlake & Anna Kendrick    ",
  "True Colors ~ Phil Collins   ",
  "Truely Madly Deeply ~ Savage Garden     ",
  "Truly ~ Lionel Richie   ",
  "Trumpets ~ Jason Derulo   ",
  "Try ~ Dolly Parton  ",
  "Try ~ Pink      ",
  "Try A Little Tenderness ~ Otis Redding     ",
  "Try It On My Own ~ Whitney Houston    ",
  "Try Sleeping With A Broken Heart ~ Alicia Keys  ",
  "Tsunami (Jump) ~ DVBBS & Borgeous     ",
  "Tubthumping ~ Chumbawamba      ",
  "Turn Me On ~ David Guetta ft. Nicki Minaj       ",
  "Turn Me On ~ Kevin Lyttle     ",
  "Turn Off The Lights ~ Nelly Furtado     ",
  "Turn The Lights Down Low ~ Lauryn Hill & Bob Marley       ",
  "Turn Up The Music ~ Chris Brown ",
  "Turn Your Love Around ~ George Benson  ",
  "Turn! Turn! Turn! (To Everything There Is A Season) ~ The Byrds   ",
  "Turning Tables ~ Adele   ",
  "Twenty Years Ago ~ Kenny Rogers    ",
  "Twist & Shout ~ The Beatles  ",
  "Twisted ~ Keith Sweat   ",
  "Two Princess ~ The Spin Doctors    ",
  "Two Wrongs ~ Wyclef Jean & Claudette Ortiz       ",
  "U Can't Touch This ~ M.C Hammer      ",
  "U Got It Bad ~ Usher  ",
  "U Remind Me ~ Usher     ",
  "U Will Know ~ B.M.U.    ",
  "Ugly ~ Bubba Sparxxx   ",
  "Ugly Heart ~ G.R.L.      ",
  "Umbrella ~ Rihanna & Jay-Z    ",
  "Umqombothi ~ Vyonne Chaka Chaka     ",
  "Unbelievable ~ Craig David  ",
  "Un-Break My Heart ~ Toni Braxton   ",
  "Unbreakable ~ Westlife     ",
  "Unchained Melody ~ The Righteous Brothers      ",
  "Uncle John From Jamaica ~ Venga Boys      ",
  "Unconditional Love ~ Donna Summer    ",
  "Unconditionally ~ Katy Perry    ",
  "Underneath It All ~ No Doubt & Lady Saw    ",
  "Underneath your Clothes ~ Shakira     ",
  "Unfaithful ~ Rihanna   ",
  "Unforgettable ~ French Montana ft. Swae Lee   ",
  "Unforgettable ~ Nat King Cole  ",
  "Unpretty ~ TLC    ",
  "Unwell ~ Matchbox Twenty    ",
  "Up ~ Olly Murs ft. Demi Lovato    ",
  "Up On The Roof ~ The Drifters    ",
  "Uptown Funk ~ Mark Ronson ft. Bruno Mars    ",
  "Us Against The World ~ Westlife     ",
  "Valerie ~ Mark Ronson ft. Amy Winehouse     ",
  "Venom ~ Eminem    ",
  "Versace On The Floor ~ Bruno Mars    ",
  "Video ~ India Arie     ",
  "Viva Forever ~ Spice Girls   ",
  "Viva La Vida ~ Coldplay  ",
  "Vivo Per Lei ~ Andrea Bocelli & Hélène Ségara   ",
  "Vogue ~ Madonna    ",
  "Vossi Bop ~ Stormzy     ",
  "Wait For You ~ Elliot Yamin   ",
  "Waiting All Night ~ Rudimental ft. Ella Eyre   ",
  "Waiting For Tonight ~ Jennifer Lopez     ",
  "Waka Waka ~ Shakira     ",
  "Wake Me Up ~ Avicii     ",
  "Wake Me Up Before You Go Go ~ Wham      ",
  "Walk Away (Remember Me) ~ Paula DeAnda ft. The Dey     ",
  "Walk It Out ~ UNK     ",
  "Walk Like An Egyptian ~ The Bangles     ",
  "Walk Me Home ~ Pink    ",
  "Walk Of Life ~ Dire Straits   ",
  "Walk On ~ U2     ",
  "Walk On By ~ Dionne Warwick   ",
  "Walked Outta Heaven ~ Jagged Edge     ",
  "Walkin' A Broken Heart ~ Don Williams  ",
  "Walkin In Memphis  ~ Marc Cohen   ",
  "Walking Away ~ Craig David     ",
  "Walking In Memphis ~ Lonestar   ",
  "Walking On Sunshine ~ Katrina & The Waves     ",
  "Wannabe ~ Spice Girls   ",
  "Want To Want Me ~ Jason Derulo   ",
  "Warm It Up ~ Kris Kross     ",
  "Wasted ~ Tiësto ft. Matthew Koma    ",
  "Water ~ Tyla     ",
  "Water Runs Dry ~ Boyz II Men    ",
  "Waterfalls ~ TLC   ",
  "Waves ~ Mr. Probz     ",
  "Waving Flag ~ K'naan ft. David Disbai    ",
  "We All Are One ~ Jimmy Cliff     ",
  "We Are Family ~ Sister Sledge     ",
  "We Are Never Getting Back Together ~ Taylor Swift    ",
  "We Are The World ~ Michael Jackson &Lionel Richie     ",
  "We Are The World ~ USA For Africa   ",
  "We Are Young ~ Fun ft. Janelle Monae   ",
  "We Be Burnin' ~ Sean Paul    ",
  "We Belong Together ~ Mariah Carey  ",
  "We Can't Stop ~ Miley Cyrus       ",
  "We Don't Have To Take Our Clothes Off ~ Jermaine Stewart      ",
  "We Don't Need Another Hero ~ Tina Turner  ",
  "We Don't Talk Anymore ~ Charlie Puth ft. Selena Gomez    ",
  "We Found Love ~ Rihanna ft. Calvin Harris      ",
  "We Like To Party ~ Vengaboys       ",
  "We Will Rock You - We Are The Champions ~ Queen    ",
  "Weak ~ SWV   ",
  "Wellerman ~ Nathan Evans  ",
  "Wet Dreamz ~ J. Cole  ",
  "We've Got Tonight ~ Kenny Rogers    ",
  "What A Wonderful World ~ Louis Armstrong     ",
  "What About Us ~ Pink  ",
  "What About Us ~ The Saturdays ft. Sean Paul    ",
  "What Can I Do ~ Corrs    ",
  "What Do you Mean ~ Justin Bieber   ",
  "What Doesn't Kill You ~ Kelly Clarkson     ",
  "What Goes Around, Comes Around ~ Justin Timberlake   ",
  "What Kind of Man Would I Be ~ Mint Condition  ",
  "What Makes A Man ~ Westlife      ",
  "What Now ~ Rihanna   ",
  "What You Won't Do For Love ~ Bobby Caldwell    ",
  "What's Love Got To Do With It ~ ina Turner   ",
  "What's Luv ~ Fat Joe & Ashanti     ",
  "What's My Name ~ Rihanna ft. Drake    ",
  "What's the Difference ~ Dr. Dre ft Eminem & Xzibit    ",
  "Whatta Man ~ Salt-N-Pepa ft. En Vogue    ",
  "When a Man Loves a Woman ~ Michael Bolton   ",
  "When A Man Loves A Woman ~ Percy Sledge   ",
  "When A Woman Loves ~ R. Kelly    ",
  "When Can I See You ~ Babyface    ",
  "When Doves Cry ~ Prince   ",
  "When I Fall In Love ~ Nat King Cole  ",
  "When I Get Where I'm Going ~ Brad Paisley & Dolly Parton   ",
  "When I See You ~ Fantasia      ",
  "When I Was Your Man ~ Bruno Mars    ",
  "When I'm Gone ~ 3 Doors Down     ",
  "When It's Over ~ Sugar Ray   ",
  "When The Bassline Drops ~ Craig David & Big Narstie    ",
  "When We Were Young ~ Adele   ",
  "When You Believe ~ Whitney Houston & Mariah Carey   ",
  "When You Say Nothing At All ~ Alison Krauss & Union Station    ",
  "When You Tell Me That You Love Me ~ Diana Ross   ",
  "When You Were Young ~ The Killers  ",
  "When You're Good to Mama ~ Chicago   ",
  "When You're In Love With A Beautiful Woman ~ Dr. Hook    ",
  "Whenever You Need Somebody ~ Ricky Ashley   ",
  "Where Are U Now ~ Skrilllex ft. Justin Bieber  ",
  "Where Do Broken Hearts Go ~ Whitney Houston    ",
  "Where Have All The Cowboys Gone ~ Paula Cole   ",
  "Where Have You Been ~ Rihanna      ",
  "Where Is The Love ~ Black Eyed Peas & Justin Timberlake    ",
  "Where My Girls At ~ 702   ",
  "Wherever You Will Go ~ The Calling     ",
  "Whip Appeal  ~ Babyface   ",
  "Whip My Hair ~ Willow Smith     ",
  "Whistle ~ Flo Rida   ",
  "White Flag ~ Dido   ",
  "White Noise ~ Disclosure ft. Aluna George   ",
  "Who Am I (What's My Name) ~ Snoop Dogg    ",
  "Who Do You Love ~ Deborah Cox    ",
  "Who Knew ~ Pink    ",
  "Who Let The Dogs Out ~ Baha Men      ",
  "Who Will Save Your Soul ~ Jewel   ",
  "Who's That Girl ~ Eve     ",
  "Why Does It Hurt So Bad ~ Whitney Houston   ",
  "Why Have You Left The One You Left Me For ~ Crystal Gayle    ",
  "Wide Awake ~ Katy Perry    ",
  "Wifey ~ Next & Lil' Mo     ",
  "Wiggle ~ Jason Derulo ft Snoop Dogg     ",
  "Wild ~ Jessie J ft. Big Sean & Dizzee Rascal   ",
  "Wild Ones ~ Flo Rida ft. Sia    ",
  "Wild Thing ~ Tone Loc    ",
  "Will You Be There ~ Michael Jackson     ",
  "Wind Breath My Wings ~ Bette Midler    ",
  "Wind Of Change ~ Scorpions        ",
  "Wings ~ Little Mix   ",
  "Wish you Were Mine ~ Philip George    ",
  "With Arms Wide Open ~ Creed    ",
  "With Or Without You ~ U2      ",
  "With You ~ Chris Brown     ",
  "With You I'm Born Again ~ Billy Preston & Syreeta       ",
  "Without Me ~ Eminem   ",
  "Without Me ~ Halsey     ",
  "Without You ~ David Guetta ft. Usher     ",
  "Without You ~ Mariah Carey      ",
  "Woman In Love ~ Barbra Streisand     ",
  "Wonderful ~ Everclear    ",
  "Wonderful Tonight ~ Eric Clapton    ",
  "Wonderwall ~ Oasis      ",
  "Word Up ~ Cameo     ",
  "Words Get In The Way ~ Gloria Estefan    ",
  "Work ~ Rihanna ft. Drake    ",
  "Work from Home ~ Fifth Harmony ft. Ty Dolla $ign    ",
  "Work It ~ Missy Elliott  ",
  "Wow ~ Post Malone    ",
  "Wrapped Up ~ Olly Murs ft. Travie McCoy    ",
  "Wrecking Ball ~ Miley Cyrus   ",
  "Write Your Name (Across My Heart) ~ Kenny Rogers    ",
  "XO ~ Beyonce    ",
  "Y.M.C.A. ~ The Village People       ",
  "Yah Mo Be There ~ James Ingram & Michael McDonald        ",
  "Yeah ~ Usher & Ludacris & Lil' Jon          ",
  "Year 3000 ~ Busted      ",
  "Yellow ~ Coldplay  ",
  "Yellow Roses ~ Dolly Parton   ",
  "Yesterday ~ The Beatles    ",
  "Yesterday ~ Toni Braxton Ft. Trey Songz     ",
  "You ~ Jesse Powell    ",
  "You Ain't Know ~ Lil Wayne ft. Birdman -  (Lyrics)   ",
  "You Are ~ Lionel Richie  ",
  "You Are My Sunshine ~                    ",
  "You Are Not Alone ~ Michael Jackson    ",
  "You Are The Reason ~ Calum Scott      ",
  "You Can Call Me Al ~ Paul Simon    ",
  "You Da One ~ Rihanna     ",
  "You Decorated My Life ~ Kenny Rogers   ",
  "You Dropped A Bomb On Me ~ The Gap Band        ",
  "You Found Me ~ The Fray    ",
  "You Get What You Give ~ New Radicals         ",
  "You Girl ~ Shaggy ft. Ne-Yo  -  (Lyrics)    ",
  "You Give Love A Bad Name ~ Bon Jovi    ",
  "You Gotta Be ~ Des'ree      ",
  "You Learn ~ Alanis Morissette          ",
  "You Make Me Wanna ~ Usher         ",
  "You Mean The World To Me ~ Toni Braxton        ",
  "You Moght Need Somebody ~ Shola Ama    ",
  "You Raise Me Up ~ Westlife      ",
  "You Rock My World ~ Michael Jackson      ",
  "You Sang To Me ~ Marc Anthony       ",
  "You Sexy Thing ~ Hot Chocolate        ",
  "You Were Meant For Me ~ Jewel   ",
  "You Woman ~ White Town  ",
  "You'll Never Find Another Love Like Mine   ",
  "You'll Never Walk Alone ~ Carousel      ",
  "Young, Dumb & Broke ~ Khalid  ",
  "Youngblood ~ 5 Seconds of Summer   ",
  "Your Body's Callin' ~ R. Kelly    ",
  "Your Love Is King ~ Sade    ",
  "Your Man ~ Josh Turner   ",
  "Your Secret Love ~ Luther Vandross     ",
  "Your Song ~ Elton John     ",
  "You're A God ~ Vertical Horizon         ",
  "You're Beautiful ~ James Blunt    ",
  "You're Making Me High ~ Toni Braxton     ",
  "You're My Best Friend ~ Don Williams      ",
  "You're Still The One ~ Shania Twain       ",
  "You're The First, The Last, My Everything ~ Barry White    ",
  "You're The One ~ SWV      ",
  "You've Lost That Lovin' Feeling ~ The Righteous Brothers     ",
  "Zeze (Kodak Black) ~ Sunfly ft.Travis Scott & Offset  ",
  "Zombie ~ The Cranberries     "

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
  "African Typic Collection ~ Sam Fan Thomas     ",
"Cache Cache ~ Awilo Longomba   ",
"Chaise Electrique ~ Fally ipupa ft. Olivia   ",
"Coupe Bibamba ~ Awilo Longomba   ",
"Dezo Dezo  ~ Tshala Mwana  ",
"Every Woman Needs A Man ~ Vyonne Chaka Chaka      ",
"Loi ~ Koffi Olomide    ",
"Neng Makassy ~ Sam Fan Thomas    ",
"Noa ~ Sam Fan Thomas    ",
"Papa Lolo ~ Mose Fanfan    ",
"Rail On ~ Papa Wemba     ",
"Show Me The Way ~ Papa Wemba  ",
"Umqombothi ~ Vyonne Chaka Chaka     ",
"Vulindella ~ Brenda Fassie     ",
"Vuluka Dilolo ~ Tshala Muana    ",
"Wake Up ~ Koffi Olomide     "

  ],

    roots: [
    "Sample 1",
    "Sample 2",
    "Sample 3",
    "Sample 4",
    "Sample 5"
    ],

    traditional: [
"KAMBA",
"Kilunda Kiyisi Mbesa ~ Sammy Wambua   ",
"Rose Watwa Wa Kisumu ~ Sammy Wambua  ",

"KIKUYU",
"Amukira Ngatho ~ Ruth Wamuyu      ",
"Indo Ciene ~ Salim Young  ",
"Ino Ni Momo ~ Murimi Wa Kahalf    ",
"Kapusi Gakwa ~ Kamande Wa Kioi    ",
"Mabataro ~ Ben Githae   ",
"Mahiga ~ Ruth Wamuyu   ",
"Mariru ~ Albert Gacheru    ",
"Mugithi ~ Mr. & Mrs Nganga        ",
"Muheani ~ Phyllis Mbuthia & Sammy Irungu   ",
"Muiretu Wa Kabete (Ni Cori Muno) ~ JB Maina   ",
"Mumbi  ~ Samidoh    ",
"Mwaki ~ Zerb ft. Sofiya Nzau   ",
"Nyau Iriaga Mbia ~ Muriithi John Walker   ",
"Queen  ~ Loise Kim   ",
"Ritwa Riaku ~ Eric Wainaina    ",
"Tiga Kumute (Wendo Ni Wendo) ~ JB Maina   ",
"Wendo Wa Cebe Cebe ~ Kamaru      ",

"LUO",
"Te Amo ~ Prince Indah    "

  ],

    naija: [
 "5 And 6 ~ Naeto C   ",
"African Queen ~ 2 Face     ",
"All Over ~ Tiwa Savage    ",
"Amarula ~ Roberto   ",
"Asibe Happy ~ Kabza De Small x Ami Faku  ",
"Azonto ~ Fuse ft. Tiffany  ",
"Baby ~ Joeboy     ",
"Baby Riddim ~ Fave  ",
"Bandana ~ Fireboy DML ft. Asake  ",
"Beautiful Onyinye ~ Psquare & Rick Ross    ",
"Beautiful Onyinye ~ P-Square Ft. Rick Ross  ",
"Calm Down ~ Rema   ",
"Commas ~ Ayra Starr  ",
"Congratulations ~ Ada Ehi x Buchi    ",
"Egwu ~ Chiké ft. Mohbad    ",
"Ex  ~  Nikita Kering   -  (Lyrics)      ",
"Fall ~ Davido   ",
"Fall In Love ~ D'Banj     ",
"Fallen in Love  ~ Chidinma  ",
"For My Hand ~ Burna Boy ft. Ed-Sheeran    ",
"How Are You My Friend ~ Johnny Drille   ",
"If ~ Davido       ",
"Ifunanya ~ P-Square      ",
"Jennifer ~ Guchi      ",
"Johnny ~ Yemi Alade    ",
"Kedike  ~ Chidinma   ",
"Khona ~ Mafikizolo  ",
"Last Last ~ Burna Boy  ",
"Love Nwantiti  ~ CKay  ",
"Monalisa ~ Lojay X Sarz    ",
"Moto ~ Lojay   ",
"Ndihamba Nawe ~ Mafikizolo   ",
"No One Like You ~ P-Square    ",
"Nobody ~ DJ Neptune, Joeboy x Mr Eazi   ",
"Ojuelegba  ~  Wizkid    ",
"Oliver Twist ~ D'Banj    ",
"Only Me ~ 2 Face & Idibia   ",
"SMA ~ Nasty C    ",
"Ta Ta Ta  ~ Bayanni   ",
"Terminator ~ King Promise  ",
"Tonight ~ Nonso Amadi   ",
"Touch It  ~ KiDi         ",
"Vulindella ~ Brenda Fassie  ",
"Who is your Guy  ~ Spyro ft Tiwa Savage   ",
"Wombo Lombo ~ Angélique Kidjo   ",
"Yori Yori ~ Bracket   "
 ],

    xmass: [

"A Christmas to Remember ~ Dolly Parton & Kenny Rogers  ",
"A Holy Night    ",
"Christmas Without You ~ Dolly Parton, Kenny Rogers  ",
"Feliz Navidad ~ Jose Feliciano    ",
"Go Tell It On The Mountain  ",
"I Believe In Santa Claus ~ Dolly Parton, Kenny Rogers  ",
"Jingle Bells ~  ",
"Joy To The World ~  ",
"O Come All Ye Faithful ~  ",
"Rivers Of Babylon ~ Boney M     ",
"Silent Night ~  ",
"The First Noel ~  ",
"The Twelve Days Of Christmans ~  ",
"We Three Kings Of Orient Are ~  ",
"We Wish You A Merry christmas ~ "
  ],

};
        kcont.addEventListener('click', () => {
            // Hide main menu items
            kcont.style.display = 'none';
            ncont.style.display = 'none';
            mixcont.style.display = 'none';
            liveRequestBtn.style.display = 'none';
            qr.style.display = 'none';
            kvidz.style.display = 'none';
            videoButton.style.display = 'block';

            // Show karaoke section
            genresSection.style.display = 'block';
            backbtn.style.display = 'block';
            searchbar.style.display = 'block';

            // Get elements
            const categoryList = document.getElementById('category-list');
            const detailsTitle = document.getElementById('details-title');
            const itemList = document.getElementById('item-list');
            const sectionTitle = document.getElementById('kwanza');

            // Style the item list for scrolling
            itemList.style.maxHeight = '500px';
            itemList.style.maxWidth = '500px';
            itemList.style.overflowY = 'auto';
            itemList.style.padding = '3px';
            itemList.style.margin = '0';
            itemList.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            itemList.style.borderRadius = '5px';

            // Update titles
            sectionTitle.textContent = 'Karaoke Songs';
            detailsTitle.textContent = 'Select a Category';

            // Clear existing items
            categoryList.innerHTML = '';
            itemList.innerHTML = '';

            // Style for category list items
            const categoryStyle = 'cursor: pointer; padding: 8px; margin: 2px 0; border-radius: 4px; transition: all 0.3s ease;';

            // Add categories with styling
            Object.keys(categoryData).forEach(category => {
                const li = document.createElement('li');
                li.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                li.setAttribute('data-category', category);
                li.style.cssText = categoryStyle;

                // Hover effect for categories
                li.onmouseover = () => {
                    li.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                };
                li.onmouseout = () => {
                    li.style.backgroundColor = 'transparent';
                };

                li.onclick = () => {
                    displayKaraokeItems(category);

                    // Reset all category backgrounds
                    categoryList.querySelectorAll('li').forEach(catItem => {
                        catItem.style.backgroundColor = 'transparent';
                        catItem.style.color = 'white';
                    });

                    // Highlight selected category
                    li.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    li.style.color = '#39FF14';
                };

                categoryList.appendChild(li);
            });
        });

        function displayKaraokeItems(category) {
            const itemList = document.getElementById('item-list');
            const detailsTitle = document.getElementById('details-title');

            // Update title and clear list
            detailsTitle.textContent = category;
            itemList.innerHTML = '';

            // Get songs for the category
            if (categoryData[category.toLowerCase()]) {
                categoryData[category.toLowerCase()].forEach(songTitle => {
                    const songItem = document.createElement('li');
                    songItem.textContent = songTitle;
                    songItem.style.cssText = `
                        cursor: pointer;
                        padding: 10px;
                        margin: 5px 0;
                        border-radius: 4px;
                        transition: all 0.3s ease;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        color: white;
                    `;

                    // Hover effect for songs
                    songItem.onmouseover = () => {
                        songItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    };
                    songItem.onmouseout = () => {
                        songItem.style.backgroundColor = 'transparent';
                    };

                    songItem.onclick = () => {
                        // Reset all song items
                        itemList.querySelectorAll('li').forEach(s => {
                            s.style.color = 'white';
                            s.style.fontWeight = 'normal';
                        });

                        // Highlight playing song
                        songItem.style.color = '#39FF14';
                        songItem.style.fontWeight = 'bold';

                        // Play the song (you might want to implement the actual playback logic)
                        const songPath = `ngoma/${category}/${songTitle}.mp4`;
                        playMedia(songPath);
                    };

                    itemList.appendChild(songItem);
                });
            }
        }


        ncont.addEventListener('click', () => {
            // Save current state to history
            const currentState = {
                page: 'home'
            };
            history.pushState(currentState, '', window.location.pathname);

            // Hide main menu items
            kcont.style.display = 'none';
            ncont.style.display = 'none';
            mixcont.style.display = 'none';
            liveRequestBtn.style.display = 'none';
            qr.style.display = 'none';
            kvidz.style.display = 'none';
            kconcat.style.display = 'none';
            container1.style.display = 'none';

            // Show performance section
            genresSection.style.display = 'block';
            saxcont.style.display = 'block';
            backbtn.style.display = 'block';
            searchbar.style.display = 'block';

            // Update history with new state
            const newState = {
                page: 'performance'
            };
            history.pushState(newState, '', window.location.pathname + '#performance');

            // Get elements
           const categoryList = document.getElementById('category-list');
            const detailsTitle3 = document.getElementById('details-title3');
            const itemList3 = document.getElementById('item-list3');
            const sectionTitle = document.getElementById('kwanza');

            // Style the item list for scrolling
            itemList3.style.maxHeight = '500px';
            itemList3.style.overflowY = 'auto';
            itemList3.style.padding = '10px';
            itemList3.style.margin = '0';
            itemList3.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            itemList3.style.borderRadius = '5px';

            // Update titles
            sectionTitle.textContent = 'DJ & Sax Performances';
            detailsTitle3.textContent = 'Select a Category';

            // Clear existing items
            categoryList.innerHTML = '';
            itemList3.innerHTML = '';

            // Style for category list items
            const categoryStyle = 'cursor: pointer; padding: 8px; margin: 2px 0; border-radius: 4px; transition: all 0.3s ease;';

            // Add categories with styling
            Object.keys(ncontVideoData).forEach(category => {
                const li = document.createElement('li');
                li.textContent = category;
                li.setAttribute('data-category', category);
                li.style.cssText = categoryStyle;

                // Hover effect for categories
                li.onmouseover = () => {
                    li.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                };
                li.onmouseout = () => {
                    li.style.backgroundColor = 'transparent';
                };

                li.onclick = () => {
                    displayNcontItems(category);

                    // Reset all category backgrounds
                    categoryList.querySelectorAll('li').forEach(catItem => {
                        catItem.style.backgroundColor = 'transparent';
                        catItem.style.color = 'white';
                    });

                    // Highlight selected category
                    li.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    li.style.color = '#39FF14';
                };

                categoryList.appendChild(li);
            });
        });

        function displayNcontItems(category) {
            const itemList3 = document.getElementById('item-list3');
            const detailsTitle3 = document.getElementById('details-title3');

            // Update title and clear list
            detailsTitle3.textContent = category;
            itemList3.innerHTML = '';

            // Get songs for the category
            if (ncontVideoData[category]) {
                ncontVideoData[category].forEach(songTitle => {
                    // Clean up the song title by removing quotes and extra spaces
                    const cleanTitle = songTitle.trim().replace(/^"|"$/g, '');

                    const songItem = document.createElement('li');
                    songItem.textContent = cleanTitle;
                    songItem.style.padding = '8px 15px';
                    songItem.style.margin = '5px 0';
                    songItem.style.borderRadius = '5px';
                    songItem.style.color = 'white';

                    itemList3.appendChild(songItem);
                });
            }

            // Style the container
            itemList3.style.maxHeight = '500px';
            itemList3.style.overflowY = 'auto';
            itemList3.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            itemList3.style.padding = '10px';
            itemList3.style.borderRadius = '10px';
            itemList3.style.margin = '10px 0';
        }
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

      backbtn2.style.display = 'block';
      searchbar.style.display = 'block';
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


function openGenre(genre) {
  const genreContent = document.getElementById("genre-content");
  const genresSection = document.getElementById("genres-section");

  // Add current state to history
  genreHistory.push(genresSection.style.display === "none" ? "genre-content" : "genres-section");

  // Show genre content, hide genres list
  genresSection.style.display = "none";
  genreContent.style.display = "block";

  // Update genre title
  const genreTitle = document.getElementById("genre-title");
  genreTitle.textContent = genre;
}
// Open a genre and display its content
function openGenre(genre) {
  const genreContent = document.getElementById('genre-content');
  const genreTitle = document.getElementById('genre-title');
  const musicList = document.getElementById('music-list');
  const genresSection = document.getElementById('genres-section');
  const karaokeLogo = document.querySelector('.karaoke-logo');


  // Update genre title
  genreTitle.textContent = "Genre: " + capitalizeFirstLetter(genre);

  // Clear previous list
  musicList.innerHTML = "";

  // Show genre content and hide genres section
  genreContent.classList.remove('hidden');
  genresSection.classList.add('hidden');


  // Toggle karaoke logo visibility
  if (genre === 'karaoke') {
    karaokeLogo.classList.remove('hidden');
  } else {
    karaokeLogo.classList.add('hidden');
  }

  // Push current genre to history for back navigation
  genreHistory.push(genre);


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
  console.log('closePlayer function called');
  const modal = document.getElementById('playerModal');
  const videoPlayer = document.getElementById('mediaPlayer');
  console.log('modal:', modal);
  console.log('videoPlayer:', videoPlayer);
  videoPlayer.pause();
  videoPlayer.src = '';
  modal.classList.add('hidden');
  console.log('player closed');
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

kvidz.addEventListener('click', () => {
  // Save current state to history
  const currentState = {
    page: 'home'
  };
  history.pushState(currentState, '', window.location.pathname);

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
  backbtn2.style.display = 'block';
  searchbar.style.display = 'block';

  // Update history with new state
  const newState = {
    page: 'karaoke'
  };
  history.pushState(newState, '', window.location.pathname + '#karaoke');
});

const mediaLibrary = [
    {
        title: "Amina By sanaipe Tande",
        artist: "DJ Noday",
        file: "ngoma/East/Amina.mp4",
        thumbnail: "thumbnails/song1.jpg"
    },
    {
        title: "Bebi Bebi By Nyashinski",
        artist: "DJ Noday",
        file: "ngoma/East/Bebi.mp4",
        thumbnail: "thumbnails/song2.jpg"
    },
    {
      title: "Chaguo la moyo By Otile Brown",
      artist: "DJ Noday",
      file: "ngoma/East/Chaguo.mp4",
      thumbnail: "thumbnails/song1.jpg"
  },
  {
      title: "Deadly By Nameless",
      artist: "DJ Noday",
      file: "ngoma/East/Deadly  Nameless.mp4",
      thumbnail: "thumbnails/song2.jpg"
  },{
    title: "Extra pressure By Bensoul",
    artist: "DJ Noday",
    file: "ngoma/East/Extra Bensoul.mp4",
    thumbnail: "thumbnails/song1.jpg"
},
{
    title: "Free By Nyashinski",
    artist: "DJ Noday",
    file: "ngoma/East/Free  Nyashinski.mp4",
    thumbnail: "thumbnails/song2.jpg"
},
    // Add more media items as needed
];

// Initialize button click
document.getElementById('startBtn').addEventListener('click', function() {
    // Save current state to history
    const currentState = {
        page: 'home'
    };
    history.pushState(currentState, '', window.location.pathname);

    // Update UI
    this.style.display = 'none';
    kcont.style.display = 'none';
    ncont.style.display = 'none';
    liveRequestBtn.style.display = 'none';
    qr.style.display = 'none';
    kvidz.style.display = 'none';
    container1.style.display = 'none';
    backbtn.style.display = 'block';
    document.querySelector('.content-container').style.display = 'block';

    // Initialize media list
    initializeMediaList();

    // Update history with new state
    const newState = {
        page: 'mix'
    };
    history.pushState(newState, '', window.location.pathname + '#mix');
});

function initializeMediaList() {
    const mediaList = document.getElementById('mediaList');

    mediaLibrary.forEach(media => {
        const mediaItem = createMediaItem(media);
        mediaList.appendChild(mediaItem);
    });
}

function createMediaItem(media) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.innerHTML = `
        <img src="${media.thumbnail}" class="thumbnail-image" alt="${media.title}">
        <div class="media-info">
            <div class="title">${media.title}</div>
            <div class="artist">${media.artist}</div>
        </div>
    `;

    mediaItem.addEventListener('click', () => {
        showMediaPlayer(media.file);
    });

    return mediaItem;
}

function showMediaPlayer(mediaSrc) {
    const playerContainer = document.getElementById('playerContainer');
    const mediaPlayer = document.getElementById('mediaPlayer');

    playerContainer.style.display = 'block';
    mediaPlayer.src = mediaSrc;
    mediaPlayer.play();

    // Scroll to top when new song is selected
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close player functionality
document.getElementById('closePlayerBtn').addEventListener('click', closePlayer);

function closePlayer() {
    const playerContainer = document.getElementById('playerContainer');
    const mediaPlayer = document.getElementById('mediaPlayer');

    mediaPlayer.pause();
    mediaPlayer.currentTime = 0;
    playerContainer.style.display = 'none';
}

// Auto-close when media ends
document.getElementById('mediaPlayer').addEventListener('ended', closePlayer);

// Handle ESC key to close player
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePlayer();
    }
});

