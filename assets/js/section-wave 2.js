(function () {
  function initSectionWave() {
    var wave = document.querySelector("[data-section-wave]");
    var path = wave && wave.querySelector("[data-section-wave-path]");

    if (!wave || !path) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var pointXs = [0, 190, 550, 865, 1170, 1380, 1440];
    var pointYs = [92, 28, 138, 54, 122, 30, 36];
    var driftAmplitudes = [1, 2, 2.5, 1.5, 2, 1.75, 1];
    var driftSpeeds = [0.08, 0.11, 0.07, 0.1, 0.075, 0.09, 0.08];
    var phases = [0, 1.2, 2.8, 0.5, 3.9, 2, 4.6];
    var frameId = null;

    function render(now) {
      var time = now / 1000;
      var points = pointXs.map(function (x, index) {
        var drift = Math.sin(time * driftSpeeds[index] + phases[index]) * driftAmplitudes[index];

        return {
          x: x,
          y: pointYs[index] + drift
        };
      });
      var data = "M" + points[0].x + " " + points[0].y.toFixed(2);

      for (var index = 0; index < points.length - 1; index += 1) {
        var previous = points[Math.max(0, index - 1)];
        var start = points[index];
        var end = points[index + 1];
        var next = points[Math.min(points.length - 1, index + 2)];
        var controlOneX = start.x + (end.x - previous.x) / 6;
        var controlOneY = start.y + (end.y - previous.y) / 6;
        var controlTwoX = end.x - (next.x - start.x) / 6;
        var controlTwoY = end.y - (next.y - start.y) / 6;

        data += " C" + controlOneX.toFixed(2) + " " + controlOneY.toFixed(2);
        data += " " + controlTwoX.toFixed(2) + " " + controlTwoY.toFixed(2);
        data += " " + end.x + " " + end.y.toFixed(2);
      }

      path.setAttribute("d", data + " L1440 220 L0 220 Z");
      frameId = window.requestAnimationFrame(render);
    }

    function start() {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(render);
    }

    function stop() {
      if (frameId === null) return;
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSectionWave);
  } else {
    initSectionWave();
  }
})();
