console.log("VERSION 2 LIVE");
console.log("Dashboard JS loaded");

const CALENDAR_URLS = [
  "https://calendar.google.com/calendar/ical/marlonv%40gmail.com/private-9dfa077d3df5faaa16c06ebf026a20f7/basic.ics",
  "https://calendar.planningcenteronline.com/icals/eJxj4ajmsGLLz2RmM2ey4kotzi8oAQmUZjLzTLG34ihLTvZU4isoTcrJLM5ITWGzYnMNsWIvK_FUEgQLJseXZOamFrNZc4ZYcRckFiXmFlczAACsLhf725a297e40c67372ac835df92d81b42aa66141064"
];

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

async function loadCalendars() {
  const allEvents = [];

  for (const url of CALENDAR_URLS) {
    const response = await fetch(url);
    const text = await response.text();
    const events = parseICS(text);
    allEvents.push(...events);
  }

  const now = new Date();

  const upcoming = allEvents
    .filter(e => e.start >= now)
    .sort((a, b) => a.start - b.start)
    .slice(0, 6);

  renderEvents(upcoming);
}

function renderEvents(events) {
  const list = document.getElementById("events");
  list.innerHTML = "";

  if (events.length === 0) {
    list.innerHTML = "<li>No upcoming events</li>";
    return;
  }

  for (const event of events) {
    const li = document.createElement("li");

    const time = event.start.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

    li.textContent = `${time} — ${event.summary}`;
    list.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCalendars();
});
