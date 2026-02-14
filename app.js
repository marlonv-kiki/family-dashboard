console.log("Dashboard JS loaded");

// ==========================
// CONFIG
// ==========================

const CALENDAR_URLS = [
  "https://calendar-proxy.marlonv.workers.dev?type=calendar&url=https://calendar.google.com/calendar/ical/marlonv%40gmail.com/public/basic.ics",
  "https://calendar-proxy.marlonv.workers.dev?type=calendar&url=https://calendar.planningcenteronline.com/icals/eJxj4ajmsGLLz2RmM2ey4kotzi8oAQmUZjLzTLG34ihLTvZU4isoTcrJLM5ITWGzYnMNsWIvK_FUEgQLJseXZOamFrNZc4ZYcRckFiXmFlczAACsLhf725a297e40c67372ac835df92d81b42aa66141064"
];

const WEATHER_URL =
  "https://calendar-proxy.marlonv.workers.dev?type=weather";

// ==========================
// DATE
// ==========================

function loadDate() {
  const today = new Date();
  const options = { weekday: "long", month: "long", day: "numeric" };
  document.getElementById("date").textContent =
    today.toLocaleDateString("en-US", options);
}

// ==========================
// WEATHER
// ==========================

async function loadWeather() {
  try {
    const res = await fetch(WEATHER_URL);
    const data = await res.json();

    const temp = Math.round(data.current_weather.temperature);

    document.getElementById("temperature").textContent = temp + "°";

    // Simple weather emoji
    const code = data.current_weather.weathercode;
    const icon = document.getElementById("weather-icon");

    if (code < 3) icon.src = "https://cdn-icons-png.flaticon.com/512/869/869869.png"; // sunny
    else if (code < 50) icon.src = "https://cdn-icons-png.flaticon.com/512/1163/1163624.png"; // cloudy
    else icon.src = "https://cdn-icons-png.flaticon.com/512/414/414927.png"; // rain

  } catch (err) {
    console.error("Weather error:", err);
  }
}

// ==========================
// ICS PARSER
// ==========================

function parseICS(text) {
  const events = [];
  const lines = text.split(/\r?\n/);

  let event = null;

  for (let line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      event = {};
    } else if (line.startsWith("END:VEVENT")) {
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

// ==========================
// LOAD CALENDARS
// ==========================

async function loadCalendars() {
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  let allEvents = [];

  for (let url of CALENDAR_URLS) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const events = parseICS(text);
      allEvents = allEvents.concat(events);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    }
  }

  // Filter to today only
  const todayEvents = allEvents.filter(event => {
    return event.start.toISOString().slice(0, 10) === todayString;
  });

  // Sort by time
  todayEvents.sort((a, b) => a.start - b.start);

  const list = document.getElementById("events");
  list.innerHTML = "";

  if (todayEvents.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No events today.";
    list.appendChild(li);
    return;
  }

  for (let event of todayEvents) {
    const li = document.createElement("li");

    const time = event.start.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

    li.textContent = `${time} — ${event.summary}`;
    list.appendChild(li);
  }
}

// ==========================
// INIT
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  loadDate();
  loadWeather();
  loadCalendars();
});
