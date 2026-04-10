import requests
from datetime import datetime

API_KEY = '0db91be46ccd04c933a4904c13d78c74'
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

WEATHER_EMOJI = {
    "clear": "☀️",
    "cloud": "☁️",
    "rain": "🌧️",
    "drizzle": "🌦️",
    "thunder": "⛈️",
    "snow": "❄️",
    "mist": "🌫️",
    "fog": "🌫️",
    "haze": "🌫️",
}

def get_weather_emoji(description: str) -> str:
    description = description.lower()
    for keyword, emoji in WEATHER_EMOJI.items():
        if keyword in description:
            return emoji
    return "🌡️"

def fetch_weather(city: str) -> dict | None:
    try:
        response = requests.get(
            BASE_URL,
            params={"q": city, "appid": API_KEY, "units": "metric"},
            timeout=10,
        )

        if response.status_code == 404:
            print(f"  ❌ City '{city}' not found. Check the spelling and try again.")
            return None
        elif response.status_code == 401:
            print("  ❌ Invalid API key.")
            return None
        elif response.status_code != 200:
            print(f"  ❌ Unexpected error (HTTP {response.status_code}).")
            return None

        return response.json()

    except requests.exceptions.Timeout:
        print("  ⏳ Request timed out. Check your internet connection.")
    except requests.exceptions.ConnectionError:
        print("  🔌 No internet connection.")
    except Exception as e:
        print(f"  ⚠️  Unexpected error: {e}")

    return None

def display_current(data: dict) -> None:
    city_name   = data["city"]["name"]
    country     = data["city"]["country"]
    current     = data["list"][0]
    description = current["weather"][0]["description"].capitalize()
    emoji       = get_weather_emoji(description)

    print(f"\n{'='*45}")
    print(f"  📍 {city_name}, {country}")
    print(f"{'='*45}")
    print(f"  {emoji}  Condition   : {description}")
    print(f"  🌡️  Temperature : {current['main']['temp']}°C  (feels like {current['main']['feels_like']}°C)")
    print(f"  💧 Humidity    : {current['main']['humidity']}%")
    print(f"  💨 Wind Speed  : {current['wind']['speed']} m/s")
    if "visibility" in current:
        print(f"  👁️  Visibility  : {current['visibility'] / 1000:.1f} km")

def display_forecast(data: dict) -> None:
    """Show one reading per day for the next 4 days (skipping today)."""
    print(f"\n  📅 4-Day Forecast")
    print(f"  {'-'*38}")

    seen_dates = set()
    today      = datetime.now().date()

    for entry in data["list"]:
        dt          = datetime.fromtimestamp(entry["dt"])
        entry_date  = dt.date()

        # Skip today and duplicate dates
        if entry_date == today or entry_date in seen_dates:
            continue
        if len(seen_dates) >= 4:
            break

        seen_dates.add(entry_date)
        desc    = entry["weather"][0]["description"].capitalize()
        emoji   = get_weather_emoji(desc)
        day_str = dt.strftime("%A, %b %d")

        print(f"  {day_str:<20} {emoji}  {desc:<20} {entry['main']['temp']}°C")

    print(f"{'='*45}\n")

def main() -> None:
    print("🌤️  Nigerian City Weather Forecast")
    print("    (type 'quit' to exit)\n")

    while True:
        city = input("Enter city name: ").strip()

        if city.lower() in ("quit", "exit", "q"):
            print("Goodbye! 👋")
            break
        if not city:
            print("  ⚠️  Please enter a city name.\n")
            continue

        data = fetch_weather(city)
        if data:
            display_current(data)
            display_forecast(data)

if __name__ == "__main__":
    main()