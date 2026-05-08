const weatherInput = document.getElementById("weatherInput");
const searchBtn = document.getElementById("searchBtn");
const forecastRow = document.getElementById("forecastRow");






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

        document.querySelector(".temp").textContent =
            `${Math.round(weatherData.main.temp)}°F`;

        document.querySelector(".condition").textContent =
            weatherData.weather[0].description;

        document.querySelector(".location").textContent =
            `${weatherData.name}, ${weatherData.sys.country}`;

        // Update background based on weather condition
        updateBackgroundByWeather(weatherData.weather[0].description);

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