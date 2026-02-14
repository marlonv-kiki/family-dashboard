console.log("Dashboard JS loaded");

// 🔹 USE YOUR PUBLIC GOOGLE CALENDAR LINK HERE
const CALENDAR_URL =
  "https://calendar-proxy.marlonv.workers.dev?type=calendar&url=https://calendar.google.com/calendar/ical/marlonv%40gmail.com/public/basic.ics";

// 🔹 WEATHER (Hartwell, GA)
const WEATHER_URL =
  "https://calendar-proxy.marlonv.workers.dev?type=weather";

// ----------------------------
// DATE
// ----------------------------
function loadDate() {
  const dateEl = document.getElementById("date");
  const now = new Date();

  const options = { weekday: "long", month: "long", day: "numeric" };
  dateEl.textContent = now.toLocaleDateString("en-US", options);
}

// ----------------------------
// WEATHER
// ----------------------------
async function loadWeather() {
  try {
    const res = await fetch(WEATHER_URL);
    const data = await res.json();

    const temp = Math.round(data.current_weather.temperature);
    const code = data.current_weather.weathercode;

    const tempEl = document.getElementById("temperature");
    const iconEl = document.getElementById("weather-icon");

    if (tempEl) tempEl.textContent = temp + "°";

    if (iconEl) {
      if (code < 3) {
        iconEl.src =
          "https://cdn-icons-png.flaticon.com/512/869/869869.png"; // sun
      } else if (code < 50) {
        iconEl.src =
          "https://cdn-icons-png.flaticon.com/512/1163/1163624.png"; // cloud
      } else {
        iconEl.src =
          "https://cdn-icons-png.flaticon.com/512/414/414927.png"; // rain
      }
    }
  } catch (err) {
    console.error("Weather error:", err);
  }
}

// ----------------------------
// PARSE ICS
// ----------------------------
function parseICS(text) {
  const events = [];
  const lines = text.split(/\r?\n/);
  let event = null;

  for (let line of lines) {
    if (line === "BEGIN:VEVENT") {
      event = {};
    } else if (line === "END:VEVENT") {
      if (event.start && event.summary) {
        events.push(event);
      }
      event = null;
    } else if (event) {
      if (line.startsWith("DTSTART")) {
        event.start = parseICSTime(line);
      }
      if (line.startsWith("SUMMARY")) {
        event.summary = line.split(":").slice(1).join(":");
      }
    }
  }

  return events;
}

function parseICSTime(line) {
  const value = line.split(":")[1];

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11) || "00";
  const min = value.slice(11, 13) || "00";

  return new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
}

// ----------------------------
// LOAD CALENDAR
// ----------------------------
async function loadCalendar() {
  try {
    const res = await fetch(CALENDAR_URL);
    const text = await res.text();
    const events = parseICS(text);

    const today = new Date();
    const todayString = today.toDateString();

    const todayEvents = events.filter(
      (e) => e.start.toDateString() === todayString
    );

    todayEvents.sort((a, b) => a.start - b.start);

    const list = document.getElementById("events");
    list.innerHTML = "";

    if (todayEvents.length === 0) {
      list.innerHTML = "<li>No events today</li>";
      return;
    }

    for (let event of todayEvents) {
      const li = document.createElement("li");

      const time = event.start.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      li.textContent = `${time} — ${event.summary}`;
      list.appendChild(li);
    }
  } catch (err) {
    console.error("Calendar error:", err);
  }
}

// ----------------------------
// START EVERYTHING
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadDate();
  loadWeather();
  loadCalendar();
});
