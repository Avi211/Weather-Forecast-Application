const apiKey = "4e23ddaab0837450bedd27684ffce7dc";

const searchBtn = document.getElementById("searchBtn");
const locateBtn = document.getElementById("locateBtn");
const cityInput = document.getElementById("cityInput");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");
const recentCities = document.getElementById("recentCities");

const fetchWeather = async (city) => {
  try {
    const resp = await fetch(
       ` https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!resp.ok) throw new Error("City not found");
    const data = await resp.json();
    updateUI(data);
    updateRecentCities(city);
  } catch (error) {
    alert(error.message);
  }
}

const fetchLocationWeather = () => {
  if (!navigator.geolocation){
    alert("Geolocation is not supported by your browser");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try{ 
    const resp = await fetch(
     ` https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );
    if(!resp.ok) throw new Error("Location data not found");
    const data = await resp.json();
    updateUI(data);
  } catch (error){
    alert(error.message);
  }
},
(error) => {
  alert("Unable to retrieve your location");
}
  );
};

const updateUI = (data) => {
  const city = data.city && data.city.name ? data.city.name : "Unknown Location";
  const today = data.list[0];

  currentWeather.innerHTML = `
    <h2 class="text-lg font-bold">${city} (${today.dt_txt.split(" ")[0]})</h2>
    <p>Temperature: ${today.main.temp.toFixed(1)}°C</p>
    <p>Wind: ${today.wind.speed} M/S</p>
    <p>Humidity: ${today.main.humidity}%</p>
    <img src="https://openweathermap.org/img/wn/${today.weather[0].icon}@2x.png" class="w-16 h-16"/>
    <p>${today.weather[0].description}</p>
  `;
  currentWeather.classList.remove("hidden");

  forecast.innerHTML = "";
  const filtered = data.list.filter(item => item.dt_txt.includes("12:00:00"));
  filtered.forEach(day => {
    forecast.innerHTML += `
      <div class="bg-gray-600 text-white p-2 rounded">
        <p class="text-sm">(${day.dt_txt.split(" ")[0]})</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" class="w-10 h-10"/>
        <p>Temp: ${day.main.temp.toFixed(1)}°C</p>
        <p>Wind: ${day.wind.speed} M/S</p>
        <p>Humidity: ${day.main.humidity}%</p>
      </div>
    `;
  });
};

const updateRecentCities = (city) => {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
  renderCityDropdown(cities);
};

const renderCityDropdown = (cities) => {
  recentCities.innerHTML = "";
  if (cities.length === 0) {
    recentCities.classList.add("hidden");
    return;
  }

  recentCities.classList.remove("hidden");
  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.innerText = city;
    recentCities.appendChild(option);
  });
};

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
  else alert("Please enter a city name.");
});

locateBtn.addEventListener("click", fetchLocationWeather);

recentCities.addEventListener("change", (e) => {
  const city = e.target.value;
  if (city) fetchWeather(city);
});

window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("recentCities")) || [];
  renderCityDropdown(saved);
};

