// CALCPAL/js/background.js
// This file can be used for any background effects or animations.
// For now, it's a placeholder.

document.addEventListener('DOMContentLoaded', () => {
    console.log("Background script loaded. Add your background effects here!");

    // Example: A simple effect that changes background color slightly on scroll (very basic)
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const body = document.body;
        // Adjust these values to get the desired effect
        const opacity = Math.min(scrollPosition / 500, 0.2);
        body.style.backgroundColor = `rgba(248, 249, 250, ${1 - opacity})`; // Lightens background on scroll
    });
});