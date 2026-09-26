(function () {
  function initExperiencePlaybook() {
    var section = document.querySelector("[data-experience-playbook]");
    var track = document.querySelector("[data-experience-playbook-track]");

    if (!section || !track) return;

    var features = Array.from(section.querySelectorAll("[data-playbook-feature]"));
    var featureMedia = features.map(function (feature) {
      return feature.querySelector("img") || feature.querySelector(".experience-playbook__placeholder");
    });
    var copies = Array.from(section.querySelectorAll("[data-playbook-copy]"));
    var rails = Array.from(section.querySelectorAll("[data-playbook-rail]"));
    var headings = Array.from(section.querySelectorAll("[data-playbook-heading]"));
    var descriptions = Array.from(section.querySelectorAll("[data-playbook-description]"));
    var notes = Array.from(section.querySelectorAll("[data-playbook-note]"));
    var progressStates = Array.from(section.querySelectorAll("[data-playbook-progress]"));
    var copyViewport = section.querySelector(".experience-playbook__copy-viewport");

    if (!window.gsap || !window.ScrollTrigger) return;

    if (
      !features.length ||
      features.length !== copies.length ||
      copies.length !== rails.length ||
      rails.length !== headings.length ||
      headings.length !== descriptions.length ||
      descriptions.length !== notes.length ||
      notes.length !== progressStates.length
    ) return;

    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      ignoreMobileResize: true
    });

    var media = window.gsap.matchMedia();
    media.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        section.classList.add("is-enhanced");

        function setTrackHeight() {
          track.style.height = Math.round(window.innerHeight * (features.length * 1.2 + 1)) + "px";
        }

        var headingEndScale = 0.56;

        function headingEndY() {
          return copyViewport ? copyViewport.offsetHeight * -0.03 : 0;
        }

        function headingEndX(heading) {
          return function () {
            if (!copyViewport) return 0;
            return (copyViewport.offsetWidth - heading.offsetWidth * headingEndScale) / 2;
          };
        }

        function setActiveRail(activeIndex) {
          rails.forEach(function (rail, railIndex) {
            rail.classList.toggle("is-active", railIndex === activeIndex);
          });
        }

        setTrackHeight();

        window.gsap.set(features, {
          zIndex: function (index) {
            return index + 1;
          },
          xPercent: function (index) {
            return index === 0 ? 0 : 100;
          }
        });

        window.gsap.set(copies, {
          opacity: function (index) {
            return index === 0 ? 1 : 0;
          },
          yPercent: function (index) {
            return index === 0 ? 0 : 25;
          }
        });

        window.gsap.set(headings, {
          x: 0,
          y: 0,
          scale: 1,
          transformOrigin: "left top"
        });

        window.gsap.set(descriptions, {
          opacity: 0,
          y: 24
        });

        window.gsap.set(notes, {
          opacity: 1,
          y: 0
        });

        window.gsap.set(progressStates, {
          opacity: function (index) {
            return index === 0 ? 1 : 0;
          }
        });

        window.gsap.set(rails, {
          opacity: function (index) {
            return index === 0 ? 1 : 0;
          }
        });

        var activeRailIndex = -1;
        var segmentDuration = 2.05;

        function syncActiveRail(activeIndex) {
          if (activeIndex === activeRailIndex) return;
          activeRailIndex = activeIndex;
          setActiveRail(activeIndex);
        }

        syncActiveRail(0);

        var timeline = window.gsap.timeline({
          defaults: {
            ease: "none"
          },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: false,
            refreshPriority: 0,
            onUpdate: function () {
              syncActiveRail(Math.min(
                features.length - 1,
                Math.max(0, Math.floor((timeline.time() + 0.85) / segmentDuration))
              ));
            }
          }
        });

        for (var index = 0; index < features.length; index += 1) {
          var segmentStart = index * segmentDuration;
          var detailStart = segmentStart + 0.25;

          timeline.to(headings[index], {
            x: headingEndX(headings[index]),
            y: headingEndY,
            scale: headingEndScale,
            duration: 0.5
          }, detailStart);

          timeline.to(notes[index], {
            y: -16,
            opacity: 0,
            duration: 0.28
          }, detailStart);

          timeline.to(descriptions[index], {
            y: 0,
            opacity: 1,
            duration: 0.4
          }, detailStart + 0.16);

          if (index < features.length - 1) {
            var transitionStart = segmentStart + 1.2;

            timeline.to(copies[index], {
              yPercent: -100,
              opacity: 0,
              duration: 0.45
            }, transitionStart);

            timeline.fromTo(copies[index + 1], {
              yPercent: 20,
              opacity: 0
            }, {
              yPercent: 0,
              opacity: 1,
              duration: 0.45
            }, transitionStart + 0.12);

            timeline.to(features[index + 1], {
              xPercent: 0,
              duration: 0.6
            }, transitionStart);

            timeline.to(rails[index], {
              opacity: 0,
              duration: 0.4
            }, transitionStart);

            timeline.to(rails[index + 1], {
              opacity: 1,
              duration: 0.45
            }, transitionStart + 0.04);

            timeline.to(progressStates[index], {
              opacity: 0,
              duration: 0.24
            }, transitionStart);

            timeline.to(progressStates[index + 1], {
              opacity: 1,
              duration: 0.24
            }, transitionStart + 0.08);
          }
        }

        timeline.to({}, { duration: 0.45 }, features.length * segmentDuration);

        return function () {
          timeline.kill();
          section.classList.remove("is-enhanced");
          track.style.height = "";
          setActiveRail(0);
          window.gsap.set(
            features.concat(featureMedia.filter(Boolean), copies, rails, headings, descriptions, notes, progressStates),
            {
              clearProps: "all"
            }
          );
        };
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExperiencePlaybook);
  } else {
    initExperiencePlaybook();
  }
})();
