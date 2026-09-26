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
          track.style.height = Math.round(window.innerHeight * (features.length * 1.55 + 1)) + "px";
        }

        function headingShift() {
          return copyViewport ? copyViewport.offsetHeight * -0.07 : 0;
        }

        function setActiveRail(activeIndex) {
          rails.forEach(function (rail, railIndex) {
            rail.classList.toggle("is-active", railIndex === activeIndex);
          });
        }

        setTrackHeight();

        window.gsap.set(features, {
          force3D: true,
          zIndex: function (index) {
            return index + 1;
          },
          xPercent: function (index) {
            return index === 0 ? 0 : 100;
          }
        });

        window.gsap.set(featureMedia.filter(Boolean), {
          force3D: true,
          xPercent: function (index) {
            return index === 0 ? 0 : -100;
          }
        });

        window.gsap.set(copies, {
          force3D: true,
          opacity: function (index) {
            return index === 0 ? 1 : 0;
          },
          yPercent: function (index) {
            return index === 0 ? 0 : 25;
          }
        });

        window.gsap.set(headings, {
          force3D: true,
          y: 0,
          scale: 1,
          transformOrigin: "left top"
        });

        window.gsap.set(descriptions, {
          force3D: true,
          opacity: 0,
          y: 30
        });

        window.gsap.set(notes, {
          force3D: true,
          opacity: 1,
          y: 0
        });

        window.gsap.set(rails, {
          opacity: function (index) {
            return index === 0 ? 1 : 0;
          }
        });

        window.gsap.set(progressStates, {
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
            ease: "none",
            force3D: true
          },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.15,
            invalidateOnRefresh: true,
            refreshPriority: 0,
            onUpdate: function () {
              syncActiveRail(Math.min(
                features.length - 1,
                Math.max(0, Math.floor(timeline.time() / segmentDuration))
              ));
            }
          }
        });

        for (var index = 0; index < features.length; index += 1) {
          var segmentStart = index * segmentDuration;
          var detailStart = segmentStart + 0.25;

          timeline.to(headings[index], {
            y: headingShift,
            scale: 0.78,
            duration: 0.58,
            ease: "power2.inOut"
          }, detailStart);

          timeline.to(notes[index], {
            y: -18,
            opacity: 0,
            duration: 0.3
          }, detailStart);

          timeline.to(descriptions[index], {
            y: 0,
            opacity: 1,
            duration: 0.48,
            ease: "power2.out"
          }, detailStart + 0.18);

          if (index < features.length - 1) {
            var transitionStart = segmentStart + 1.2;
            var nextMedia = featureMedia[index + 1];

            timeline.to(copies[index], {
              yPercent: -110,
              opacity: 0,
              duration: 0.5
            }, transitionStart);

            timeline.fromTo(copies[index + 1], {
              yPercent: 25,
              opacity: 0
            }, {
              yPercent: 0,
              opacity: 1,
              duration: 0.56,
              ease: "power2.out"
            }, transitionStart + 0.16);

            timeline.to(features[index + 1], {
              xPercent: 0,
              duration: 0.72,
              ease: "power2.inOut"
            }, transitionStart);

            if (nextMedia) {
              timeline.to(nextMedia, {
                xPercent: 0,
                duration: 0.72,
                ease: "power2.inOut"
              }, transitionStart);
            }

            timeline.to(progressStates[index], {
              opacity: 0,
              duration: 0.3,
              ease: "power1.inOut"
            }, transitionStart + 0.04);

            timeline.to(progressStates[index + 1], {
              opacity: 1,
              duration: 0.36,
              ease: "power1.inOut"
            }, transitionStart + 0.12);

            timeline.to(rails[index], {
              opacity: 0,
              duration: 0.24
            }, transitionStart + 0.08);

            timeline.to(rails[index + 1], {
              opacity: 1,
              duration: 0.3
            }, transitionStart + 0.22);
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
