(function () {
  function initHeroParallax() {
    var hero = document.getElementById("home-introduction");
    var copy = hero && hero.querySelector('[data-hero-parallax="copy"]');
    var card = hero && hero.querySelector('[data-hero-parallax="card"]');
    var backdrop = hero && hero.querySelector('[data-hero-parallax="backdrop"]');
    var portrait = hero && hero.querySelector('[data-hero-layer="media"]');

    if (!hero || !copy || !card || !backdrop || !portrait || !window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    var media = window.gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", function () {
      window.gsap.set(portrait, {
        xPercent: -54,
        force3D: true
      });

      var timeline = window.gsap.timeline({
        defaults: {
          ease: "none",
          force3D: true
        },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.35,
          invalidateOnRefresh: false
        }
      });

      timeline.to(copy, {
        y: function () {
          return -window.innerHeight * 0.22;
        }
      }, 0);

      timeline.to(card, {
        y: function () {
          return window.innerHeight * 0.16;
        }
      }, 0);

      timeline.to(backdrop, {
        y: function () {
          return window.innerHeight * 0.05;
        }
      }, 0);

      timeline.to(portrait, {
        xPercent: -54,
        y: function () {
          return window.innerHeight * 0.08;
        }
      }, 0);

      return function () {
        timeline.kill();
        window.gsap.set([copy, card, backdrop, portrait], { clearProps: "transform" });
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroParallax);
  } else {
    initHeroParallax();
  }
})();
