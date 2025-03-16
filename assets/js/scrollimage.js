document.addEventListener("DOMContentLoaded", () => {
    // Only initialize on screens larger than 768px
    if (window.innerWidth <= 768) return;

    const scrollImage = document.querySelector(".scroll\\:image");
    const scrollText = document.querySelector(".scrolltext");
    if (!scrollImage || !scrollText) return;

    // Set initial state
    gsap.set(scrollImage, {
        opacity: 0,
        scale: 0.8,
        y: "100%",
        rotation: 5,
        transformOrigin: "center center"
    });

    // Create a single scroll trigger animation
    ScrollTrigger.create({
        trigger: scrollText,
        start: "top center",
        end: "bottom top",
        scrub: 4,
        markers: false,
        onUpdate: (self) => {
            const progress = self.progress;
            
            gsap.to(scrollImage, {
                opacity: 1 * progress,
                scale: 0.8 + (0.2 * progress),
                y: `${65 - (progress * 200)}%`,
                rotation: 5 - (progress * 8),
                duration: 0.2,
                ease: "none"
            });
        }
    });
}); 