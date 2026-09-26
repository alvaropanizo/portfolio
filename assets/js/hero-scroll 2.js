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
      function createTrigger(scrub) {
        return {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: scrub,
          invalidateOnRefresh: true
        };
      }

      var copyTween = window.gsap.to(copy, {
        y: function () {
          return -window.innerHeight * 0.24;
        },
        ease: "none",
        scrollTrigger: createTrigger(0.3)
      });

      var cardTween = window.gsap.to(card, {
        y: function () {
          return window.innerHeight * 0.18;
        },
        ease: "none",
        scrollTrigger: createTrigger(0.45)
      });

      var backdropTween = window.gsap.to(backdrop, {
        y: function () {
          return window.innerHeight * 0.06;
        },
        ease: "none",
        scrollTrigger: createTrigger(0.8)
      });

      var portraitTween = window.gsap.to(portrait, {
        y: function () {
          return window.innerHeight * 0.1;
        },
        ease: "none",
        scrollTrigger: createTrigger(0.65)
      });

      return function () {
        copyTween.kill();
        cardTween.kill();
        backdropTween.kill();
        portraitTween.kill();
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
