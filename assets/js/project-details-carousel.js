document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-project-carousel]").forEach((root) => {
    const slides = [...root.querySelectorAll("[data-carousel-slide]")];
    const prevBtn = root.querySelector("[data-carousel-prev]");
    const nextBtn = root.querySelector("[data-carousel-next]");
    if (slides.length === 0) return;

    let index = 0;

    const setIframeTabbable = (slide, active) => {
      const iframe = slide.querySelector("[data-carousel-iframe]");
      if (!iframe) return;
      if (active) iframe.removeAttribute("tabindex");
      else iframe.setAttribute("tabindex", "-1");
    };

    const depthClassNames = ["is-depth-0", "is-depth-1", "is-depth-2", "is-depth-3", "is-depth-4", "is-depth-5"];

    const applyDepth = () => {
      const n = slides.length;
      const maxDepthClass = 5;
      slides.forEach((slide, i) => {
        const rel = (i - index + n) % n;
        slide.classList.remove(...depthClassNames);
        const depthClass = `is-depth-${Math.min(rel, maxDepthClass)}`;
        slide.classList.add(depthClass);
        slide.setAttribute("aria-hidden", rel === 0 ? "false" : "true");
        if ("inert" in HTMLElement.prototype) {
          slide.inert = rel !== 0;
        }
        setIframeTabbable(slide, rel === 0);
      });
    };

    const go = (delta) => {
      const n = slides.length;
      index = (index + delta + n) % n;
      applyDepth();
    };

    prevBtn?.addEventListener("click", () => go(-1));
    nextBtn?.addEventListener("click", () => go(1));

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    });

    applyDepth();
  });
});
