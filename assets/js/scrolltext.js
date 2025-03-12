// Register GSAP and ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Function to wrap each word in the target element with a span
function wrapWords() {
  const scrollText = document.querySelector('.scrolltext');
  
  if (!scrollText) return; // Exit if there's no element with the class .scrolltext

  const text = scrollText.innerHTML;
  const words = text.split(' ');

  const wrappedWords = words.map(word => `<span class="word">${word}</span>`).join(' ');

  scrollText.innerHTML = wrappedWords;
}

// Call the function to wrap words when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  wrapWords(); // Wrap words when the page loads

  // After wrapping, apply GSAP animations
  const words = document.querySelectorAll('.word');

  // Apply the GSAP animation for each word
  words.forEach((word, index) => {
    gsap.fromTo(word, {
      opacity: 0.05,     // Start with low opacity
      y: 20,             // Start with a slight downward offset
    }, {
      opacity: 1,        // Animate to full opacity
      y: 0,              // Animate to the original position
      duration: 1,       // Animation duration
      delay: index * 0.1, // Stagger delay for each word
      scrollTrigger: {
        trigger: word,  // Trigger animation on each word
        start: 'top 80%', // Start animation when the word reaches 80% of the viewport height
        end: 'top 20%',   // End animation when the word reaches 20% of the viewport height
        scrub: true,      // Link animation to scroll position
        markers: false,   // Disable markers for debugging
      }
    });
  });
});
