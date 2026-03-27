document.addEventListener("DOMContentLoaded", () => {
    // Only initialize on screens larger than 768px
    if (window.innerWidth <= 768) return;

    // Ensure the plugin is registered (safe to call multiple times)
    gsap.registerPlugin(ScrollTrigger);

    const scrollImage = document.querySelector(".scroll\\:image");
    const scrollText = document.querySelector(".scrolltext");
    if (!scrollImage || !scrollText) return;

    const clamp01 = (n) => Math.max(0, Math.min(1, n));
    const easeInPow = (t, pow = 3) => Math.pow(t, pow);
    const easeOutPow = (t, pow = 3) => 1 - Math.pow(1 - t, pow);

    // Warps progress so movement slows near a specific "center" point.
    // strength: 0 (no warp) -> 1 (full warp)
    function slowNear(p, center, strength = 0.55, pow = 3) {
        const progress = clamp01(p);
        const c = clamp01(center);
        const s = clamp01(strength);
        if (s === 0 || c === 0 || c === 1) return progress;

        let warped;
        if (progress < c) {
            const t = progress / c; // 0..1
            warped = easeOutPow(t, pow) * c;
        } else {
            const t = (progress - c) / (1 - c); // 0..1
            warped = c + easeInPow(t, pow) * (1 - c);
        }

        return progress + (warped - progress) * s;
    }

    // Compute the ScrollTrigger progress value where the fixed image's center
    // would align with the viewport center (based on current viewport + element size).
    function computeCenterProgress() {
        const rect = scrollImage.getBoundingClientRect();
        const h = rect.height || scrollImage.offsetHeight || 1;
        const vh = window.innerHeight || 1;

        // With `position: fixed; bottom: 0;`, translateY(%) shifts by % of element height.
        // Solve for translateY% that puts the element's center at viewport center:
        // yCenter% = 50 * (h - vh) / h
        const yCenterPercent = 50 * (h - vh) / h;

        // Your animation maps progress -> y% via: y% = 65 - (progress * 200)
        // Invert to find progress at which y% == yCenterPercent:
        return clamp01((65 - yCenterPercent) / 200);
    }

    // Set initial state
    gsap.set(scrollImage, {
        opacity: 0,
        scale: 0.8,
        y: "100%",
        rotation: 5,
        transformOrigin: "center center"
    });

    let centerProgress = computeCenterProgress();
    window.addEventListener("resize", () => {
        centerProgress = computeCenterProgress();
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
            const moveProgress = slowNear(progress, centerProgress, 0.55, 3);
            
            // Keep opacity/scale linear, but slow down movement near viewport center.
            gsap.set(scrollImage, {
                opacity: progress,
                scale: 0.8 + (0.2 * progress),
                y: `${65 - (moveProgress * 200)}%`,
                rotation: 5 - (moveProgress * 8)
            });
        }
    });
}); 