document.addEventListener("DOMContentLoaded", () => {
  const triggers = document.querySelectorAll("#home-work .project\\:trigger");
  triggers.forEach((trigger) => {
    const wrapper = trigger.closest(".project\\:featured-wrapper");
    const detailsId = trigger.getAttribute("aria-controls");
    const details = detailsId ? document.getElementById(detailsId) : wrapper?.querySelector(".project\\:details");
    if (!wrapper || !details) return;

    const openDetails = () => {
      details.hidden = false;
      // Measure after unhide so max-height uses actual content.
      requestAnimationFrame(() => {
        details.style.maxHeight = `${details.scrollHeight}px`;
      });
    };

    const closeDetails = () => {
      details.style.maxHeight = `${details.scrollHeight}px`;
      requestAnimationFrame(() => {
        details.style.maxHeight = "0px";
      });
      details.addEventListener(
        "transitionend",
        () => {
          details.hidden = true;
        },
        { once: true }
      );
    };

    const toggle = () => {
      const isExpanded = wrapper.classList.toggle("is-expanded");
      trigger.setAttribute("aria-expanded", isExpanded);
      if (isExpanded) openDetails();
      else closeDetails();
    };

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
});
