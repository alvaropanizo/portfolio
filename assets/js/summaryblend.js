document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#home-about-summary");
  const triggerEl = section?.querySelector(".summary-content");
  const speakerImg = section?.querySelector(".speaker-image");
  const summaryParagraphs = section?.querySelectorAll(".summary-content p");
  if (!section || !triggerEl) return;

  const setBlend = (opacity) => {
    const o = Math.max(0, Math.min(1, opacity));
    // Strong at the start, then fades out as you scroll into the section.
    section.style.setProperty("--summary-blend-opacity", String(o));
    // Subtle upward offset while fading out
    section.style.setProperty("--summary-blend-translate", `${(1 - o) * -8}px`);
  };

  // Prefer ScrollTrigger (already on the site) for a smooth fade-out on scroll.
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    setBlend(0);

    const FADE_POWER = 1.6; // >1 = slower fade-out at the start

    window.ScrollTrigger.create({
      trigger: section,
      start: "top bottom",  // when summary starts entering
      end: "top top",       // fade out across a longer scroll distance
      scrub: true,
      onUpdate: (self) => {
        const p = Math.max(0, Math.min(1, self.progress));
        const opacity = 1 - Math.pow(p, FADE_POWER); // 1 -> 0 (slower)
        setBlend(opacity);
      },
    });

    // Summary image: slow move up + right and slow clockwise spin on scroll
    if (speakerImg) {
      gsap.to(speakerImg, {
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

    // Summary content paragraphs: left-to-right only at different speeds until section is out of view
    if (summaryParagraphs?.length) {
      const lineHeight = 1.8; // em
      const startX = -70; // px, start off to the left
      const targets = [
        { endX: 170, pace: 0.7 },
        { endX: 600, pace: 2.1 },
        { endX: 410, pace: 1.5 },
      ];
      summaryParagraphs.forEach((el, i) => {
        const cfg = targets[i] ?? { endX: 100, pace: 1 };
        gsap.set(el, { top: lineHeight * i + "em", x: startX });
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
            gsap.set(el, { x });
          });
        },
      });
    }

    return;
  }

  // Fallback (no ScrollTrigger): show briefly, then fade out.
  setBlend(1);
  window.setTimeout(() => setBlend(0), 900);
});
