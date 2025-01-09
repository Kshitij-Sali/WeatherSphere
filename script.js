const cityInput = document.querySelector('.cityInput');
const searchButton = document.querySelector(".searchBtn");
const locationButton = document.querySelector(".locationBtn");
const currentWeatherDiv = document.querySelector(".currentWeather");
const weatherCardDiv = document.querySelector(".weatherCards");

const API_KEY = "123c875556dc17ac7477257d868269d9";

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const temperature = (weatherItem.main.temp - 273.15).toFixed(2);
    const windSpeed = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const weatherIcon = weatherItem.weather[0].icon;
    const description = weatherItem.weather[0].description;

    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${date})</h2>
                    <h4>Temperature: ${temperature}°C</h4>
                    <h4>Wind: ${windSpeed}m/s</h4>
                    <h4>Humidity: ${humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}@4x.png" alt="weatherIcon">
                    <h4>${description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>(${date})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="weatherIcon">
                    <h4>Temp: ${temperature}°C</h4>
                    <h4>Wind: ${windSpeed}m/s</h4>
                    <h4>Humidity: ${humidity}%</h4>
                </li>`;
    }
}

const updateCurrentWeather = (cityName, weatherItem) => {
    currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, 0);
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardDiv.innerHTML = "";

        if (fiveDaysForecast.length > 0) {
            updateCurrentWeather(cityName, fiveDaysForecast[0]);
        }

        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index > 0) {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                if (data.length > 0) {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                } else {
                    alert("No city found for your current location.");
                }
            }).catch(() => {
                alert("An error occurred while fetching the city!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}

function updateGreeting() {
    const currentHour = new Date().getHours();
    let message;

    if (currentHour >= 5 && currentHour < 12) {
        message = "Good Morning";
    } else if (currentHour >= 12 && currentHour < 18) {
        message = "Good Afternoon";
    } else {
        message = "Good Evening";
    }

    document.getElementById('greeting').textContent = message;
}
updateGreeting();
setInterval(updateGreeting, 60 * 60 * 1000);

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());