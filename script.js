const API_URL = "https://nodayz.onrender.com/requests"; // Replace with your deployed backend URL

// DOM Elements
const liveRequestBtn = document.getElementById("liveRequestBtn");
const requestBox = document.getElementById("requestBox");
const requestForm = document.getElementById("requestForm");
const requestsDisplay = document.getElementById("requestsDisplay");
const duplicateMessage = document.getElementById("duplicateMessage");


// Show request form when button is clicked
liveRequestBtn.addEventListener("click", () => {
  liveRequestBtn.classList.add("hidden");
  requestBox.classList.remove("hidden");
});

// Fetch and display existing requests
async function fetchRequests() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    const requests = await response.json();

    // Clear and populate the request display
    requestsDisplay.innerHTML = "";
    requests.forEach(({ _id, name, request }) => {
      const requestItem = document.createElement("div");
      requestItem.className = "request-item";
      requestItem.setAttribute("data-id", _id); // Store the request ID for deletion
      requestItem.innerHTML = `
        <strong>${name || "User"}:</strong> ${request}
      `;
      
      // Add long-press event listener for deletion
      addLongPressListener(requestItem, _id);

      requestsDisplay.appendChild(requestItem);
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
  }
}

// Load requests on page load
fetchRequests();

// Handle form submission
requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const musicRequest = document.getElementById("musicRequest").value.trim();
  const userName = document.getElementById("userName").value.trim() || "User";

  if (!musicRequest) {
    alert("Please enter a music request!");
    return;
  }

  try {
    // Check for duplicates
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    const requests = await response.json();
    const duplicate = requests.some(
      (req) => req.request.toLowerCase() === musicRequest.toLowerCase()
    );

    if (duplicate) {
      duplicateMessage.classList.remove("hidden");
      setTimeout(() => duplicateMessage.classList.add("hidden"), 3000); // Hide after 3 seconds
      return;
    }

    // Post new request
    const newRequest = { name: userName, request: musicRequest };
    const postResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRequest),
    });

    if (!postResponse.ok) {
      throw new Error("Failed to post new request");
    }

    // Clear form fields
    document.getElementById("musicRequest").value = "";
    document.getElementById("userName").value = "";

    // Refresh the display with the updated list of requests
    fetchRequests();
  } catch (error) {
    console.error("Error posting request:", error);
  }
});

// Add long-press functionality to delete a request
function addLongPressListener(element, requestId) {
  let pressTimer;

  // Start timer on mouse down or touch start
  const startPress = () => {
    pressTimer = setTimeout(async () => {
      try {
        const deleteResponse = await fetch(`${API_URL}/${requestId}`, {
          method: "DELETE",
        });

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete request");
        }

        // Refresh the display with the updated list of requests
        fetchRequests();
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    }, 5000); // 5 seconds for long press
  };

  // Clear timer on mouse up, touch end, or leave
  const cancelPress = () => {
    clearTimeout(pressTimer);
  };

  element.addEventListener("mousedown", startPress);
  element.addEventListener("touchstart", startPress);
  element.addEventListener("mouseup", cancelPress);
  element.addEventListener("touchend", cancelPress);
  element.addEventListener("mouseleave", cancelPress);
}

// Periodically refresh requests to reflect auto-deletion (optional, every 1 min)
setInterval(fetchRequests, 60000);
