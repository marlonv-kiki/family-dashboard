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
