// NBA-ZONE Intro Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add click handlers for CTA buttons
    // Add click handlers for CTA buttons
    const primaryBtn = document.querySelector('.btn-primary');
    const secondaryBtn = document.querySelector('.btn-secondary');

    // Button click handling is now managed by HTML anchor tags


    // Add parallax effect to circles on mouse move
    document.addEventListener('mousemove', function (e) {
        const circles = document.querySelectorAll('.circle');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        circles.forEach((circle, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;

            circle.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // Add logo error handling - fallback if image doesn't exist
    const logo = document.getElementById('nbaLogo');
    if (logo) {
        logo.addEventListener('error', function () {
            // Create a placeholder if image fails to load
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'logo-placeholder';
            placeholder.innerHTML = '🏀';
            placeholder.style.fontSize = '100px';
            placeholder.style.marginBottom = '2rem';
            this.parentElement.appendChild(placeholder);
        });
    }

    // Add entrance animation trigger
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all animated elements
    document.querySelectorAll('.stat-item').forEach(el => observer.observe(el));

    // Add keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
    });

    // Console welcome message
    console.log('%c🏀 Welcome to NBA-ZONE! 🏀', 'color: #1e90ff; font-size: 20px; font-weight: bold;');
    console.log('%cYour Ultimate NBA Fantasy Hub', 'color: #4da6ff; font-size: 14px;');
});
