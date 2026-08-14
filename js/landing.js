/**
 * landing.js - EnergyPulse Landing Page Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Typewriter Effect
    const typewriterElement = document.getElementById('typewriter');
    const text = 'Campus Energy Intelligence';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            typewriterElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    
    // Start typewriter with a small delay
    setTimeout(typeWriter, 300);

    // 3. Parallax Effect on Hero Section
    const hero = document.getElementById('home');
    const shapes = document.getElementById('parallax-shapes');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        // Only apply parallax if hero is visible to save performance
        if (scrolled < window.innerHeight) {
            shapes.style.transform = `translate3d(0, ${scrolled * 0.4}px, 0)`;
        }
    });

    // 4. Scroll Reveal Animations with Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                
                // Trigger counter animation if element contains counters
                const counters = entry.target.querySelectorAll('.counter');
                if (counters.length > 0) {
                    counters.forEach(counter => animateCounter(counter));
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 5. Counter Animation Function
    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const isDecimal = target % 1 !== 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.innerText = isDecimal ? current.toFixed(1) : Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        
        updateCounter();
    }
    
    // 6. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 7. Trigger counters in hero stats immediately (they're above the fold)
    setTimeout(() => {
        document.querySelectorAll('.stats-container .counter').forEach(counter => {
            animateCounter(counter);
        });
    }, 500);
});
