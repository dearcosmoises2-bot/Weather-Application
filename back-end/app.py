from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from db import get_db_connection
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

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

    if response.status_code == 200:
        city_name = data["name"]
        temperature = data["main"]["temp"]
        condition = data["weather"][0]["description"]

        save_search(city_name, temperature, condition)

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

def save_search(city, temperature, condition):
    connection = get_db_connection()
    cursor = connection.cursor()

    sql = """
        INSERT INTO search_history (city, temperature, weather_condition)
        VALUES (%s, %s, %s)
    """

    values = (city, temperature, condition)

    cursor.execute(sql, values)

    connection.commit()
    cursor.close()
    connection.close()

@app.route("/history")
def get_history():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT city, temperature, weather_condition, searched_at
        FROM search_history
        ORDER BY searched_at DESC
        LIMIT 5
    """)

    history = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(history)

if __name__ == "__main__":
    app.run(debug=True)

