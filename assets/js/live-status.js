(function () {
  var CET_ZONE = "Europe/Madrid";
  var ONLINE_START = 9;
  var ONLINE_END = 18;

  function getCETParts() {
    var hourFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: CET_ZONE,
      hour: "2-digit",
      hour12: false
    });
    var weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: CET_ZONE,
      weekday: "short"
    });
    var d = new Date();
    var hour = parseInt(hourFormatter.format(d), 10);
    var weekday = weekdayFormatter.format(d);
    var isWeekend = weekday === "Sat" || weekday === "Sun";
    return { hour: hour, isWeekend: isWeekend };
  }

  function isWithinOnlineHours() {
    var parts = getCETParts();
    if (parts.isWeekend) return false;
    return parts.hour >= ONLINE_START && parts.hour < ONLINE_END;
  }

  function formatCETTime() {
    var d = new Date();
    var timeFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: CET_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    var dayFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: CET_ZONE,
      weekday: "short"
    });
    var day = dayFormatter.format(d).toUpperCase();
    var time = timeFormatter.format(d);
    return day + ", " + time + " CET";
  }

  function updateLiveStatus() {
    var statusEl = document.getElementById("live-status");
    if (!statusEl) return;

    var labelEl = statusEl.querySelector(".label");
    var cetEl = statusEl.querySelector(".status-cet");
    if (!labelEl || !cetEl) return;

    var online = isWithinOnlineHours();
    statusEl.classList.remove("status--online", "status--offline");
    statusEl.classList.add(online ? "status--online" : "status--offline");
    labelEl.textContent = online ? "ONLINE" : "OFFLINE";
    if (cetEl) cetEl.textContent = formatCETTime();
  }

  function init() {
    updateLiveStatus();
    setInterval(updateLiveStatus, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
