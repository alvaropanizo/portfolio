(function () {
  function initSliders() {
    document.querySelectorAll("[data-content-slider]").forEach(function (slider) {
      var track = slider.querySelector(".content-slider-track");
      var inner = slider.querySelector(".content-slider-inner");
      var slides = slider.querySelectorAll(".content-slider-slide");
      var prevBtn = slider.querySelector(".content-slider-prev");
      var nextBtn = slider.querySelector(".content-slider-next");

      if (!track || !inner || !slides.length || !prevBtn || !nextBtn) return;

      var currentIndex = 0;
      var totalSlides = slides.length;

      function getGapPx() {
        var style = getComputedStyle(inner);
        return parseFloat(style.gap) || 16;
      }
      function getTrackWidth() {
        return track.clientWidth || 0;
      }

      function updateTransform() {
        var gap = getGapPx();
        var trackWidth = getTrackWidth();
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-current", i === currentIndex);
        });
        var offsetToCurrent = 0;
        for (var i = 0; i < currentIndex; i++) {
          offsetToCurrent += slides[i].offsetWidth + gap;
        }
        var currentSlideWidth = slides[currentIndex].offsetWidth;
        var centerOffset = trackWidth / 2 - currentSlideWidth / 2 - offsetToCurrent;
        inner.style.transform = "translateX(" + centerOffset + "px)";
        prevBtn.classList.toggle("is-hidden", currentIndex === 0);
        nextBtn.classList.toggle("is-hidden", currentIndex >= totalSlides - 1);
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= totalSlides - 1;
      }

      prevBtn.addEventListener("click", function () {
        if (currentIndex <= 0) return;
        currentIndex--;
        updateTransform();
      });

      nextBtn.addEventListener("click", function () {
        if (currentIndex >= totalSlides - 1) return;
        currentIndex++;
        updateTransform();
      });

      updateTransform();

      if (typeof ResizeObserver !== "undefined") {
        var ro = new ResizeObserver(function () {
          updateTransform();
        });
        ro.observe(track);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSliders);
  } else {
    initSliders();
  }
})();
