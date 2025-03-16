// Register GSAP and ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function wrapWords() {
  const scrollTexts = document.querySelectorAll('.scrolltext');
  
  if (!scrollTexts.length) return;

  scrollTexts.forEach(scrollText => {
    // Create a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = scrollText.innerHTML;
    
    // Function to process text nodes only
    function processNode(node) {
      if (node.nodeType === 3) { // Text node
        const words = node.textContent.trim().split(/\s+/);
        const wrappedWords = words.map(word => {
          if (word) {
            return `<span class="word">${word}</span>`;
          }
          return '';
        }).join(' ');
        
        const span = document.createElement('span');
        span.innerHTML = wrappedWords;
        node.parentNode.replaceChild(span, node);
      } else if (node.nodeType === 1) { // Element node
        Array.from(node.childNodes).forEach(child => processNode(child));
      }
    }

    // Process all nodes
    Array.from(tempDiv.childNodes).forEach(node => processNode(node));
    scrollText.innerHTML = tempDiv.innerHTML;
  });
}

// Call the function to wrap words when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  wrapWords(); // Wrap words when the page loads

  // After wrapping, apply GSAP animations
  const words = document.querySelectorAll('.word');

  // Apply the GSAP animation for each word
  words.forEach((word, index) => {
    // Set initial state
    gsap.set(word, {
      opacity: 0,
      y: 100,
      scale: 0.5,
      filter: "blur(10px)",
      transformOrigin: "50% 50%",
      cursor: "pointer"
    });

    // Create the scroll-based reveal animation
    gsap.to(word, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 1,
      delay: index * 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: word,
        start: "top 80%",
        end: "top 20%",
        scrub: 2,
        markers: false
      }
    });

    // Add hover effect with color transition
    word.addEventListener('mouseenter', () => {
      gsap.to(word, {
        scale: 1.05,
        color: "#c8ff32", // Lime color
        duration: 0.6,
        ease: "power2.out"
      });
    });

    word.addEventListener('mouseleave', () => {
      gsap.to(word, {
        scale: 1,
        color: "inherit",
        duration: 0.6,
        ease: "power2.out"
      });
    });
  });
});
