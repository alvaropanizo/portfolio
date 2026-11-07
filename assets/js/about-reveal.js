(function () {
  function wrapWords(container) {
    var words = [];

    container.querySelectorAll("p").forEach(function (paragraph) {
      var text = paragraph.textContent.trim();
      var emphasis = paragraph.querySelector(".about-reveal__emphasis");
      var emphasisText = emphasis ? emphasis.textContent.trim() : "";
      var allWords = text.split(/\s+/);
      var emphasisWordCount = emphasisText ? emphasisText.split(/\s+/).length : 0;
      var emphasisStart = emphasisWordCount ? allWords.length - emphasisWordCount : -1;
      paragraph.textContent = "";

      allWords.forEach(function (word, index) {
        if (index === emphasisStart) {
          paragraph.appendChild(document.createElement("br"));
        }

        var span = document.createElement("span");
        span.className = index >= emphasisStart && emphasisStart >= 0
          ? "about-reveal__word about-reveal__word--emphasis"
          : "about-reveal__word";
        span.textContent = word;
        paragraph.appendChild(span);
        words.push(span);

        if (index < allWords.length - 1) {
          paragraph.appendChild(document.createTextNode(" "));
        }
      });
    });

    return words;
  }

  function initAboutReveal() {
    var section = document.querySelector("[data-about-reveal]");
    var sectionContainer = section && section.closest("#home-about");
    var copy = section && section.querySelector(".about-reveal__copy");
    var ruleClip = section && section.querySelector("[data-about-rule-clip]");

    if (!section || !copy || !ruleClip) return;

    var words = wrapWords(copy);
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches || !window.gsap || !window.ScrollTrigger) {
      words.forEach(function (word) {
        word.style.color = word.classList.contains("about-reveal__word--emphasis")
          ? "var(--color-lime)"
          : "var(--color-text-black)";
        word.style.opacity = "1";
        word.style.fontWeight = "800";
      });
      ruleClip.setAttribute("height", "1000");
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);
    var isMobile = window.matchMedia("(max-width: 767px)").matches;
    var wordStagger = isMobile ? 0.08 : 0.06;
    var wordDuration = 1;
    var lineDuration = wordDuration + Math.max(0, words.length - 1) * wordStagger;
    var pinDistanceFactor = 2.2;
    var pinTarget = isMobile && sectionContainer ? sectionContainer : section;

    var timeline = window.gsap.timeline({
      scrollTrigger: isMobile
        ? {
            trigger: pinTarget,
            start: "top 60%",
            end: "bottom 12%",
            pin: false,
            scrub: 0.55,
            invalidateOnRefresh: true
          }
        : {
            trigger: pinTarget,
            start: "top top",
            end: function () {
              return "+=" + Math.round(window.innerHeight * pinDistanceFactor);
            },
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            refreshPriority: 1,
            invalidateOnRefresh: true
          }
    });

    window.gsap.set(words, {
      opacity: isMobile ? 0.38 : 0.2,
      fontWeight: 500
    });

    timeline.to(words, {
      opacity: 1,
      fontWeight: 800,
      duration: wordDuration,
      stagger: {
        each: wordStagger,
        from: "start"
      },
      ease: "none"
    }, 0);

    timeline.fromTo(ruleClip, {
      attr: {
        height: 0
      }
    }, {
      attr: {
        height: 1000
      },
      duration: lineDuration,
      ease: "none"
    }, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAboutReveal);
  } else {
    initAboutReveal();
  }
})();
