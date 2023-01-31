// Constructing the OpenWeather API URL
var myAPIKey = '93a287ac878ed0ca6e6c6296de07e744';
var baseURL = 'https://api.openweathermap.org/data/2.5/';
var currentURL = baseURL + `weather?appid=${myAPIKey}&units=metric&`;
var forecastURL = baseURL + `forecast?appid=${myAPIKey}&units=metric&`;
var iconURL = 'https://openweathermap.org/img/w/';

// Select the HTML elements and assigning it to variables
var cityInput = $('#search-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-btn');
var locationHistory = $('#history');
var today = $('#today');
var displayDate = $(".current-day");
var daysForecast = $('#forecast');
var city = '';

//Setting the Moment time
var currentDay = moment().format('D/M/YYYY');
var forecastDay = moment();

function getCity(event) {
  // Prevent the page from refreshing on submitting the form
  event.preventDefault();
  city = cityInput.val().trim();
  // Ensure a valid city is entered
  if (!city) {
    return alert('Please enter a location first.');
  }
  cityInputEntered(city);
}

function cityInputEntered(cityName) {
  today.html('');
  daysForecast.html('');

  $.get(currentURL + `q=${cityName}`)
    .then(function (currentData) {

          // adding HTML code into #today section with the current day weather conditions 
      today.append(`
         <div class="weather-today p-3 mb-3 pl-4">
            <h1>${currentData.name} ${currentDay} <img src="${iconURL + currentData.weather[0].icon}.png"></h1>
            <p>Temperature: ${Math.round(currentData.main.temp)}ºC</p>
            <p>Wind: ${currentData.wind.speed} KPH</p>
            <p>Humidity: ${currentData.main.humidity}%</p>
          </div>
          <h3 id="forecast-headline">5-Day Forecast:</h3>
        `)

      $.get(forecastURL + `lat=${currentData.coord.lat}&lon=${currentData.coord.lon}`)
        .then(function (forecastData) {
          for (var forecastObj of forecastData.list) {
            if (forecastObj.dt_txt.includes("12:00:00")) {
              // Updating forecast days 
              forecastDay.add(1, 'day');
              // adding HTML code to display forecast cards
              daysForecast.append(`
                <div class="forecast-days ml-3 mr-3 p-4 mb-4">
                <p class="forecast-date"><b>${forecastDay.format('D/M/YYYY')}</b></p>
                <img src="${iconURL + forecastObj.weather[0].icon}.png">
                <p>Temp: ${Math.round(forecastObj.main.temp)}ºC</p>
                <p>Wind: ${forecastObj.wind.speed} KPH</p>
                <p>Humidity: ${forecastObj.main.humidity}%</p>
                </div>
              `);
            }
          }
          // Reseting forecastDay
          forecastDay = moment();
        });
    })
}

// Saving locations to localStorage
function getLocations() {
  return JSON.parse(localStorage.getItem('locations')) || [];
}

function saveLocation(arr) {
  localStorage.setItem('locations', JSON.stringify(arr));
}

function displayLocation() {
  var locations = getLocations();
  locationHistory.html('');

  // Displaying Previously searched paragraph 
  if (locations.length > 0) {
    locationHistory.append(`
    <p id="previous-search">Previously searched:</p>
    `);
  }

  locations.forEach(function (location, index) {
    locationHistory.append(`
    <button id="location-${index}" class="btn btn-outline-dark mb-2 prev-location-btn">${location}</button>
    `)
  })
}

function addLocation(event) {
  var addClick = event.type;

  if (addClick === 'click') {
    var locations = getLocations();
    var locationText = cityInput.val().toLowerCase();
    // setting the first letter of city name upper case
    locationText = locationText.charAt(0).toUpperCase() + locationText.slice(1);

    // If there is no location input or the entered location is already saved to localStorage -> skip it
    if (!locationText || locations.includes(locationText)) return;

    locations.push(locationText);
    saveLocation(locations);

    $('#previous-search').val('');
    cityInput.val('');

    displayLocation();
  }
}

// clearing local storage
function clearHistory(event) {
  localStorage.clear();
  // Remove injected HTML with previously saved locations
  locationHistory.html('');
}
clearBtn.click(clearHistory);

// Getting forecast from displayed location history
$(document).on("click", ".prev-location-btn", function () {
  var previousLocation = $(this).text();
  cityInputEntered(previousLocation);
});

function init() {
  searchBtn.click(getCity);
  searchBtn.click(addLocation);
  displayLocation();
}

init();