document.addEventListener("DOMContentLoaded", () => {
  const triggers = document.querySelectorAll("#home-work .project\\:trigger");
  triggers.forEach((trigger) => {
    const wrapper = trigger.closest(".project\\:featured-wrapper");
    const detailsId = trigger.getAttribute("aria-controls");
    const details = detailsId ? document.getElementById(detailsId) : wrapper?.querySelector(".project\\:details");
    if (!wrapper || !details) return;

    const toggle = () => {
      const isExpanded = wrapper.classList.toggle("is-expanded");
      trigger.setAttribute("aria-expanded", isExpanded);
      if (isExpanded) {
        details.hidden = false;
      } else {
        details.addEventListener(
          "transitionend",
          () => {
            details.hidden = true;
          },
          { once: true }
        );
      }
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
