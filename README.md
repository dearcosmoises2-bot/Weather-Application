# Weather-Application

This project is a weather application that allows users to search for current weather information and a 5-day forecast for a requested location.

Users can enter a city, location, or zip code into the search bar. The JavaScript frontend sends the request to the Python Flask backend, which then retrieves weather data from the OpenWeather API. The application displays the current temperature, weather condition, location, and forecast information on the page.

The application also stores successful weather searches in a database. After a few searches, users can see a dropdown menu showing their recent search history. Selecting a previous search from the dropdown will automatically search for that location again.

## Features

- Search for weather by city, location, or zip code
- Display current weather information
- Display a 5-day weather forecast
- Show weather icons for forecast conditions
- Change the page background based on the current weather condition
- Save recent searches to a database
- Show a dropdown menu with search history
- Export the current weather data as a JSON file

## How It Works

1. The user enters a location in the search box.
2. JavaScript sends the location to the Flask backend.
3. Flask sends a request to the OpenWeather API.
4. The weather data is returned to the backend.
5. The backend stores the search in the database.
6. The frontend displays the current weather and 5-day forecast.
7. The page background changes depending on the current weather condition.
8. The user can export the current weather data in JSON format.

## Requirements

To run this project locally, you will need:

- Python
- Flask
- MySQL database
- OpenWeather API key
- Required Python packages from `requirements.txt`
- Create a .env file using the .env.example as an instruction

## Installation

Install the required Python packages by running in the terminal:

pip install Flask flask-cors requests mysql-connector-python python-dotenv



