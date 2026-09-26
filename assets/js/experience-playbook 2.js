(function () {
  function initExperiencePlaybook() {
    var section = document.querySelector("[data-experience-playbook]");

    if (!section) return;

    var features = Array.from(section.querySelectorAll("[data-playbook-feature]"));
    var copies = Array.from(section.querySelectorAll("[data-playbook-copy]"));
    var rails = Array.from(section.querySelectorAll("[data-playbook-rail]"));
    var headings = Array.from(section.querySelectorAll("[data-playbook-heading]"));
    var descriptions = Array.from(section.querySelectorAll("[data-playbook-description]"));
    var notes = Array.from(section.querySelectorAll("[data-playbook-note]"));

    if (!window.gsap || !window.ScrollTrigger) return;

    if (
      !features.length ||
      features.length !== copies.length ||
      copies.length !== rails.length ||
      rails.length !== headings.length ||
      headings.length !== descriptions.length ||
      descriptions.length !== notes.length
    ) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    var media = window.gsap.matchMedia();
    media.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        section.classList.add("is-enhanced");

        window.gsap.set(features, {
          zIndex: function (index) {
            return index + 1;
          },
          clipPath: function (index) {
            return index === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)";
          }
        });

        window.gsap.set(copies, {
          autoAlpha: function (index) {
            return index === 0 ? 1 : 0;
          },
          yPercent: function (index) {
            return index === 0 ? 0 : 25;
          }
        });

        window.gsap.set(headings, {
          top: "8%",
          scale: 1,
          transformOrigin: "left top"
        });

        window.gsap.set(descriptions, {
          autoAlpha: 0,
          y: 30
        });

        window.gsap.set(notes, {
          autoAlpha: 1,
          y: 0
        });

        window.gsap.set(rails, {
          autoAlpha: function (index) {
            return index === 0 ? 1 : 0;
          }
        });

        var timeline = window.gsap.timeline({
          defaults: {
            ease: "none"
          },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: function () {
              return "+=" + Math.round(window.innerHeight * features.length * 1.55);
            },
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        var segmentDuration = 2.05;

        for (var index = 0; index < features.length; index += 1) {
          var segmentStart = index * segmentDuration;
          var detailStart = segmentStart + 0.25;

          timeline.to(headings[index], {
            top: "1%",
            scale: 0.62,
            duration: 0.58,
            ease: "power2.inOut"
          }, detailStart);

          timeline.to(notes[index], {
            y: -18,
            autoAlpha: 0,
            duration: 0.3
          }, detailStart);

          timeline.to(descriptions[index], {
            y: 0,
            autoAlpha: 1,
            duration: 0.48,
            ease: "power2.out"
          }, detailStart + 0.18);

          if (index < features.length - 1) {
            var transitionStart = segmentStart + 1.2;

            timeline.to(copies[index], {
              yPercent: -110,
              autoAlpha: 0,
              duration: 0.5
            }, transitionStart);

            timeline.fromTo(copies[index + 1], {
              yPercent: 25,
              autoAlpha: 0
            }, {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.56,
              ease: "power2.out"
            }, transitionStart + 0.16);

            timeline.to(features[index + 1], {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.72,
              ease: "power2.inOut"
            }, transitionStart);

            timeline.to(rails[index], {
              autoAlpha: 0,
              duration: 0.24
            }, transitionStart + 0.08);

            timeline.to(rails[index + 1], {
              autoAlpha: 1,
              duration: 0.3
            }, transitionStart + 0.22);
          }
        }

        timeline.to({}, { duration: 0.45 }, features.length * segmentDuration);

        return function () {
          timeline.kill();
          section.classList.remove("is-enhanced");
          window.gsap.set(
            features.concat(copies, rails, headings, descriptions, notes),
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
