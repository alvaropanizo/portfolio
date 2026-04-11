document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#home-about-summary");
  const speakerImg = section?.querySelector(".speaker-image");
  const summaryParagraphs = section?.querySelectorAll(".summary-content p");
  if (!section) return;

  // Match tablet CSS (`theme.css`): ≤1280px uses stacked summary layout; motion looks wrong
  // between 1025–1280 (e.g. iPad landscape) if we only gated at 1024px.
  const TABLET_MAX_PX = 1280;
  const smallViewportMq = window.matchMedia(
    `(max-width: ${TABLET_MAX_PX}px)`,
  );

  const freezeSummarySection = () => {
    section.style.removeProperty("--summary-blend-opacity");
    section.style.removeProperty("--summary-blend-translate");
    if (window.gsap) {
      if (speakerImg) {
        window.gsap.set(speakerImg, { clearProps: "transform" });
      }
      summaryParagraphs?.forEach((el) => {
        window.gsap.set(el, { clearProps: "transform" });
      });
    } else {
      if (speakerImg) {
        speakerImg.style.removeProperty("transform");
      }
      summaryParagraphs?.forEach((el) => {
        el.style.removeProperty("transform");
      });
    }
  };

  const killSummaryScrollMotion = () => {
    const targets = [speakerImg, ...Array.from(summaryParagraphs ?? [])].filter(
      Boolean,
    );
    if (window.gsap && targets.length) {
      window.gsap.killTweensOf(targets);
    }
    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) {
          st.kill();
        }
      });
    }
  };

  /** ≤1280px (tablet + mobile): subtle scroll-linked x on h4 lines + image drift/tilt */
  let tabletSummaryCleanup = null;

  const destroyTabletSummaryMotion = () => {
    tabletSummaryCleanup?.();
    tabletSummaryCleanup = null;
  };

  const applyStaticSummary = () => {
    destroyTabletSummaryMotion();
    killSummaryScrollMotion();
    freezeSummarySection();
  };

  const initTabletSummaryMotion = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const h4Lines = section.querySelectorAll(".summary-content p.h4");
    if (!h4Lines.length && !speakerImg) return;

    destroyTabletSummaryMotion();

    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const ctx = gsap.context(() => {
      const scrubLines = 1.35;
      const shiftX = 36;

      h4Lines.forEach((el, i) => {
        const fromLeft = i === 1 ? false : true;
        const startX = fromLeft ? -shiftX : shiftX;
        gsap.fromTo(
          el,
          { x: startX },
          {
            x: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: `top ${58 - i * 6}%`,
              end: "top 24%",
              scrub: scrubLines,
            },
          },
        );
      });

      if (speakerImg) {
        gsap.fromTo(
          speakerImg,
          {
            x: 40,
            y: -20,
            rotation: 10,
            transformOrigin: "50% 50%",
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 56%",
              end: "top 22%",
              scrub: 1.05,
            },
          },
        );
      }
    }, section);

    tabletSummaryCleanup = () => {
      ctx.revert();
    };
  };

  const isTabletViewport = () =>
    smallViewportMq.matches || window.innerWidth <= TABLET_MAX_PX;

  const tryInitTabletSummaryMotion = () => {
    if (isTabletViewport()) {
      initTabletSummaryMotion();
    }
  };

  smallViewportMq.addEventListener("change", (e) => {
    if (e.matches) {
      applyStaticSummary();
      tryInitTabletSummaryMotion();
    } else {
      destroyTabletSummaryMotion();
    }
  });

  if (isTabletViewport()) {
    applyStaticSummary();
    tryInitTabletSummaryMotion();
    return;
  }

  const reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isReduced = () => reduceMotionMq.matches;

  const setBlend = (opacity) => {
    const o = Math.max(0, Math.min(1, opacity));
    section.style.setProperty("--summary-blend-opacity", String(o));
    const shift = -8;
    section.style.setProperty("--summary-blend-translate", `${(1 - o) * shift}px`);
  };

  if (!window.gsap || !window.ScrollTrigger) {
    setBlend(1);
    window.setTimeout(() => setBlend(0), 900);
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  setBlend(0);

  const FADE_POWER = 1.6;

  window.ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "top top",
    scrub: true,
    onUpdate: (self) => {
      const p = Math.max(0, Math.min(1, self.progress));
      setBlend(1 - Math.pow(p, FADE_POWER));
    },
  });

  if (isReduced()) {
    return;
  }

  if (speakerImg) {
    window.gsap.to(speakerImg, {
      y: -100,
      x: 480,
      rotation: 20,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    });
  }

  if (summaryParagraphs?.length) {
    const lineHeight = 1.8;
    const startX = -70;
    const targets = [
      { endX: 170, pace: 0.7 },
      { endX: 600, pace: 2.1 },
      { endX: 410, pace: 1.5 },
    ];
    summaryParagraphs.forEach((el, i) => {
      const cfg = targets[i] ?? { endX: 100, pace: 1 };
      window.gsap.set(el, { top: lineHeight * i + "em", x: startX });
    });
    window.ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: 2,
      onUpdate: (self) => {
        const p = Math.max(0, Math.min(1, self.progress));
        summaryParagraphs.forEach((el, i) => {
          const cfg = targets[i] ?? { endX: 100, pace: 1 };
          const t = Math.pow(p, cfg.pace);
          const x = startX + (cfg.endX - startX) * t;
          window.gsap.set(el, { x });
        });
      },
    });
  }
});
