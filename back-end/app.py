from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

API_KEY = open("api_key", "r").read().strip()

@app.route("/")
def home():
    return "Weather API is running!"

@app.route("/weather")
def get_weather():
    city = request.args.get("city")

    if not city:
        return jsonify({"error": "City is required"}), 400

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "imperial"
    }

    response = requests.get(url, params=params)
    data = response.json()

    return jsonify(data), response.status_code


@app.route("/forecast")
def get_forecast():
    city = request.args.get("city")

    if not city:
        return jsonify({"error": "City is required"}), 400

    url = "https://api.openweathermap.org/data/2.5/forecast"

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "imperial"
    }

    response = requests.get(url, params=params)
    data = response.json()

    return jsonify(data), response.status_code



if __name__ == "__main__":
    app.run(debug=True)