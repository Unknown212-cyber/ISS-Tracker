const apiUrl = "https://api.allorigins.win/get?url=http://api.open-notify.org/iss-now.json";
const astronautsApi = "https://api.allorigins.win/get?url=" + encodeURIComponent("http://api.open-notify.org/astros.json");

const map = L.map("map").setView([0, 0], 2);
const issIcon = L.icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg",
  iconSize: [50, 32],
  iconAnchor: [25, 16],
});
let marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Update ISS location
async function updateISS() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Ensure contents exist and are valid JSON
    if (!data.contents) {
      throw new Error("Contents property is missing or undefined.");
    }

    const issData = JSON.parse(data.contents);
    const { latitude, longitude } = issData.iss_position;

    document.getElementById("latitude").textContent = latitude;
    document.getElementById("longitude").textContent = longitude;

    marker.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], map.getZoom());
  } catch (error) {
    console.error("Failed to fetch ISS data:", error.message);
  }
}


// Fetch astronaut data
async function fetchAstronauts() {
  const listContainer = document.getElementById("astronauts-list");
  listContainer.innerHTML = "";
  try {
    const response = await fetch(astronautsApi);
    const data = await response.json();

    if (!data.contents) {
      throw new Error("No contents returned from the API.");
    }

    let astronautData;
    try {
      astronautData = JSON.parse(data.contents);
    } catch (parseError) {
      throw new Error("Failed to parse astronaut data as JSON.");
    }

    astronautData.people.forEach(person => {
      const astronautItem = document.createElement("p");
      astronautItem.textContent = `${person.name} (${person.craft})`;
      listContainer.appendChild(astronautItem);
    });

    listContainer.classList.remove("hidden");
  } catch (error) {
    console.error("Failed to fetch astronauts:", error.message);
    listContainer.textContent = "Failed to load astronaut data.";
  }
}

// Event listeners
document.getElementById("astronauts-button").addEventListener("click", fetchAstronauts);

// Initial update and periodic refresh
updateISS();
setInterval(updateISS, 5000);
