// Register GSAP and ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Function to wrap each word in the target element with a span
function wrapWords() {
  const scrollTexts = document.querySelectorAll('.scrolltext');
  
  if (!scrollTexts.length) return; // Exit if there are no elements with the class .scrolltext

  scrollTexts.forEach(scrollText => {
    const text = scrollText.innerHTML;
    const words = text.split(' ');
    const wrappedWords = words.map(word => `<span class="word">${word}</span>`).join(' ');
    scrollText.innerHTML = wrappedWords;
  });
}

// Call the function to wrap words when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  wrapWords(); // Wrap words when the page loads

  // After wrapping, apply GSAP animations
  const words = document.querySelectorAll('.word');

  // Apply the GSAP animation for each word
  words.forEach((word, index) => {
    gsap.fromTo(word, {
      opacity: 0.1,      // Start with lower opacity
      y: 30,             // Start with a larger downward offset
    }, {
      opacity: 1,        // Animate to full opacity
      y: 0,              // Animate to the original position
      duration: 1.5,     // Longer animation duration
      delay: index * 0.15, // Longer stagger delay for each word
      scrollTrigger: {
        trigger: word,    // Trigger animation on each word
        start: 'top 85%', // Start animation earlier
        end: 'top 15%',   // End animation later
        scrub: 1.5,       // Smoother scrubbing with a delay
        markers: false,   // Disable markers for debugging
      }
    });
  });
});
