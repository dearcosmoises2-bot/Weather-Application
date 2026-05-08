const weatherInput = document.getElementById("weatherInput");
const searchBtn = document.getElementById("searchBtn");
const forecastRow = document.getElementById("forecastRow");
const exportBtn = document.getElementById("exportBtn");
const suggestionsDropdown = document.getElementById("suggestionsDropdown");

// Store current weather data
let currentWeatherData = null;
let searchHistory = [];

// Load search history on page load
window.addEventListener("DOMContentLoaded", () => {
    loadSearchHistory();
});

// Load search history from database
async function loadSearchHistory() {
    try {
        const response = await fetch("http://127.0.0.1:5000/history");
        const data = await response.json();
        searchHistory = data;
    } catch (error) {
        console.error("Error loading search history:", error);
    }
}

// Show suggestions when input is focused or has text
weatherInput.addEventListener("focus", () => {
    if (searchHistory.length > 0) {
        displaySuggestions(searchHistory);
    }
});

// Filter suggestions as user types
weatherInput.addEventListener("input", (e) => {
    const inputValue = e.target.value.toLowerCase();
    
    if (inputValue.length === 0) {
        displaySuggestions(searchHistory);
    } else {
        const filtered = searchHistory.filter(item =>
            item.city.toLowerCase().includes(inputValue)
        );
        displaySuggestions(filtered);
    }
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
    if (e.target !== weatherInput && e.target !== suggestionsDropdown) {
        suggestionsDropdown.classList.remove("active");
    }
});

// Display suggestions in dropdown
function displaySuggestions(suggestions) {
    suggestionsDropdown.innerHTML = "";
    
    if (suggestions.length === 0) {
        suggestionsDropdown.classList.remove("active");
        return;
    }
    
    suggestions.forEach(item => {
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item");
        suggestionItem.textContent = `${item.city} - ${item.weather_condition}`;
        
        suggestionItem.addEventListener("click", () => {
            weatherInput.value = item.city;
            suggestionsDropdown.classList.remove("active");
            searchBtn.click();
        });
        
        suggestionsDropdown.appendChild(suggestionItem);
    });
    
    suggestionsDropdown.classList.add("active");
}

// Export functionality
exportBtn.addEventListener("click", () => {
    if (!currentWeatherData) {
        alert("Please search for a city first to export weather data.");
        return;
    }

    // Create JSON object with current weather info
    const exportData = {
        city: currentWeatherData.name,
        country: currentWeatherData.sys.country,
        temperature: Math.round(currentWeatherData.main.temp),
        condition: currentWeatherData.weather[0].description,
        humidity: currentWeatherData.main.humidity,
        windSpeed: currentWeatherData.wind.speed,
        pressure: currentWeatherData.main.pressure,
        feelsLike: Math.round(currentWeatherData.main.feels_like),
        tempMin: Math.round(currentWeatherData.main.temp_min),
        tempMax: Math.round(currentWeatherData.main.temp_max),
        visibility: currentWeatherData.visibility,
        cloudiness: currentWeatherData.clouds.all,
        timestamp: new Date().toISOString()
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a blob and download
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weather_${currentWeatherData.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});



// Function to update background based on weather condition
function updateBackgroundByWeather(condition) {
    const conditionLower = condition.toLowerCase();
    
    // Remove all weather-related classes
    document.body.classList.remove("weather-clear", "weather-cloudy", "weather-rainy", "weather-stormy", "weather-snowy", "weather-foggy");
    
    if (conditionLower.includes("clear") || conditionLower.includes("sunny")) {
        document.body.classList.add("weather-clear");
    } else if (conditionLower.includes("cloud")) {
        document.body.classList.add("weather-cloudy");
    } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
        document.body.classList.add("weather-rainy");
    } else if (conditionLower.includes("thunderstorm")) {
        document.body.classList.add("weather-stormy");
    } else if (conditionLower.includes("snow")) {
        document.body.classList.add("weather-snowy");
    } else if (conditionLower.includes("mist") || conditionLower.includes("fog")) {
        document.body.classList.add("weather-foggy");
    }
}

searchBtn.addEventListener("click", getWeather);

// Map weather conditions to Font Awesome icons
function getWeatherIcon(iconCode, description) {
    const desc = description.toLowerCase();
    
    if (desc.includes("clear") || desc.includes("sunny")) {
        return "fas fa-sun";
    } else if (desc.includes("cloud")) {
        return "fas fa-cloud";
    } else if (desc.includes("rain")) {
        return "fas fa-cloud-rain";
    } else if (desc.includes("thunderstorm")) {
        return "fas fa-bolt";
    } else if (desc.includes("snow")) {
        return "fas fa-snowflake";
    } else if (desc.includes("mist") || desc.includes("fog")) {
        return "fas fa-smog";
    } else if (desc.includes("drizzle")) {
        return "fas fa-cloud-rain";
    } else if (desc.includes("overcast")) {
        return "fas fa-cloud";
    }
    
    return "fas fa-cloud";
}

async function getWeather() {
    const city = weatherInput.value.trim();

    if (!city) {
        alert("Please enter a city.");
        return;
    }

    try {
        // Current weather
        const weatherResponse = await fetch(
            `http://127.0.0.1:5000/weather?city=${encodeURIComponent(city)}`
        );

        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            alert(weatherData.message || weatherData.error || "Could not get weather.");
            return;
        }

        // Store the current weather data for export
        currentWeatherData = weatherData;

        document.querySelector(".temp").textContent =
            `${Math.round(weatherData.main.temp)}°F`;

        document.querySelector(".condition").textContent =
            weatherData.weather[0].description;

        document.querySelector(".location").textContent =
            `${weatherData.name}, ${weatherData.sys.country}`;

        // Update background based on weather condition
        updateBackgroundByWeather(weatherData.weather[0].description);

        // Refresh search history after successful search
        await loadSearchHistory();
        displaySuggestions(searchHistory);

        // 5-day forecast
        const forecastResponse = await fetch(
            `http://127.0.0.1:5000/forecast?city=${encodeURIComponent(city)}`
        );

        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
            alert(forecastData.message || forecastData.error || "Could not get forecast.");
            return;
        }

        displayForecast(forecastData);

    } catch (error) {
        console.error(error);
        alert("Could not connect to Flask. Make sure your Flask server is running.");
    }
}

function displayForecast(data) {
    forecastRow.innerHTML = "";

    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });

    const fiveDays = Object.values(dailyForecasts).slice(0, 5);

    fiveDays.forEach(day => {
        const dateObj = new Date(day.dt_txt);

        const dayName = dateObj.toLocaleDateString("en-US", {
            weekday: "long"
        });

        const date = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });

        const temp = Math.round(day.main.temp);
        const condition = day.weather[0].description;
        const iconCode = day.weather[0].icon;
        const iconClass = getWeatherIcon(iconCode, condition);

        const forecastCard = document.createElement("div");
        forecastCard.classList.add("forecast-day");

        forecastCard.innerHTML = `
            <p class="day-name">${dayName}</p>
            <p class="date">${date}</p>
            <i class="weather-icon ${iconClass}"></i>
            <p class="temp-high">${temp}°F</p>
            <p class="condition">${condition}</p>
        `;

        forecastRow.appendChild(forecastCard);
    });
}