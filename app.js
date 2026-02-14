console.log("Dashboard JS loaded");

// ==============================
// CONFIG
// ==============================

const CALENDAR_URLS = [
  "https://calendar-proxy.marlonv.workers.dev?type=calendar&url=https://calendar.google.com/calendar/ical/marlonv%40gmail.com/public/basic.ics",
  "https://calendar-proxy.marlonv.workers.dev?type=calendar&url=https://calendar.planningcenteronline.com/icals/eJxj4ajmsGLLz2RmM2ey4kotzi8oAQmUZjLzTLG34ihLTvZU4isoTcrJLM5ITWGzYnMNsWIvK_FUEgQLJseXZOamFrNZc4ZYcRckFiXmFlczAACsLhf725a297e40c67372ac835df92d81b42aa66141064"
];

// ==============================
// DATE DISPLAY
// ==============================

function updateDate() {
  const now = new Date();
  document.getElementById("date").textContent =
    now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}

// ==============================
// WEATHER
// ==============================

async function loadWeather() {
  try {
    const res = await fetch(
      "https://calendar-proxy.marlonv.workers.dev?type=weather"
    );

    const data = await res.json();
    const current = data.current_weather;

    const tempEl = document.getElementById("temperature");
    tempEl.textContent = `${Math.round(current.temperature)}°`;

    const code = current.weathercode;

    let emoji = "☁️";

    if (code === 0) emoji = "☀️";
    else if ([1,2,3].includes(code)) emoji = "⛅";
    else if ([45,48].includes(code)) emoji = "🌫";
    else if ([51,53,55,61,63,65,80,81,82].includes(code)) emoji = "🌧";
    else if ([71,73,75,85,86].includes(code)) emoji = "❄️";

    tempEl.prepend(emoji + " ");

  } catch (err) {
    console.error("Weather error:", err);
  }
}

// ==============================
// CALENDAR
// ==============================

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
  const dateStr = line.split(":")[1];
  return new Date(
    dateStr.substring(0, 4),
    dateStr.substring(4, 6) - 1,
    dateStr.substring(6, 8),
    dateStr.substring(9, 11),
    dateStr.substring(11, 13)
  );
}

async function loadCalendars() {
  const allEvents = [];

  for (let url of CALENDAR_URLS) {
    const res = await fetch(url);
    const text = await res.text();
    const events = parseICS(text);
    allEvents.push(...events);
  }

  const now = new Date();

  const upcoming = allEvents
    .filter(e => e.start >= now)
    .sort((a, b) => a.start - b.start)
    .slice(0, 10);

  const list = document.getElementById("events");
  list.innerHTML = "";

  upcoming.forEach(event => {
    const li = document.createElement("li");
    li.textContent =
      `${event.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} — ${event.summary}`;
    list.appendChild(li);
  });
}

// ==============================
// INIT
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  updateDate();
  loadWeather();
  loadCalendars();
});

// Auto refresh every 5 minutes
setInterval(() => {
  location.reload();
}, 300000);
