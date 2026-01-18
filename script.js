document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // 2. Navbar Logic (Scroll & Mobile)
    initNavbar();

    // 3. Render Projects
    renderProjects();

    // 4. Animations
    initHeroAnimation();
    initScrollReveal();
    initFooterAnimation();

    // 5. Custom Cursor (Restored)
    initCustomCursor();
});

/* =========================================
   Navbar Interaction
   ========================================= */
function initNavbar() {
    const navbar = document.querySelector('.navbar-3');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            navbar.style.backdropFilter = "blur(12px)";
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.backgroundColor = "transparent";
            navbar.style.backdropFilter = "none";
        }
    });

    // Mobile Menu Toggle
    if (menuBtn && mobileOverlay) {
        menuBtn.addEventListener('click', () => {
            const isActive = mobileOverlay.classList.toggle('is-active');
            menuBtn.classList.toggle('is-active');
            
            if (isActive) {
                gsap.to(mobileLinks, {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power3.out",
                    delay: 0.2
                });
            } else {
                gsap.to(mobileLinks, {
                    y: 40,
                    opacity: 0,
                    duration: 0.3
                });
            }
        });
    }
}

/* =========================================
   Render Projects from Data
   ========================================= */
function renderProjects() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid || typeof projectsData === 'undefined') return;

    grid.innerHTML = ''; // Clear existing

    projectsData.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card fade-in-section';
        card.style.opacity = '0'; // Initial state for animation
        card.innerHTML = `
            <a href="${project.link}" class="project-link w-inline-block">
                <div class="project-image-wrapper">
                    <img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy">
                </div>
                <div class="project-info">
                    <div class="project-meta">
                        <span class="project-category">${project.category}</span>
                        <span class="project-year">2025</span>
                    </div>
                    <h3 class="project-title">${project.title}</h3>
                </div>
            </a>
        `;
        grid.appendChild(card);
    });
}

/* =========================================
   GSAP Animations
   ========================================= */
function initHeroAnimation() {
    const headline = document.querySelector('.section-headline-text');
    const filters = document.querySelectorAll('.filter-btn');

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(headline, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5 }
    )
    .fromTo(filters, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 
        "-=0.5"
    );
}

function initScrollReveal() {
    // Wait slightly for DOM to settle
    setTimeout(() => {
        const cards = document.querySelectorAll('.project-card');
        ScrollTrigger.batch(cards, {
            start: "top 85%",
            onEnter: batch => gsap.to(batch, {
                opacity: 1, 
                y: 0, 
                stagger: 0.15, 
                duration: 0.8, 
                ease: "power3.out" 
            })
        });
    }, 100);
}

function initFooterAnimation() {
    const footer = document.querySelector('.footer-2');
    if(footer) {
        gsap.fromTo(footer,
            { opacity: 0, y: 50 },
            {
                scrollTrigger: {
                    trigger: footer,
                    start: "top 90%"
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            }
        );
    }
}

/* =========================================
   Custom Cursor Logic
   ========================================= */
function initCustomCursor() {
    // Disable on touch devices/mobile
    if (window.matchMedia("(max-width: 991px)").matches) return;

    // Remove existing cursor if any to prevent duplicates
    const existingCursor = document.querySelector('.custom-cursor');
    if (existingCursor) existingCursor.remove();

    // Create cursor element
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // Set initial position off-screen to avoid jump
    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    // Use GSAP quickTo for high performance mouse following
    const xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3.out"});
    const yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3.out"});

    // Move cursor
    window.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });

    // Hover effects
    const hoverSelectors = 'a, button, .hover-trigger, input, select, textarea, .w-tab-link, .project-card';
    const hoverables = document.querySelectorAll(hoverSelectors);

    // Add listeners to existing elements
    const addHoverListeners = (elements) => {
        elements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    };

    addHoverListeners(hoverables);

    // Observer for dynamic elements (like portfolio items loaded via JS)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const newLinks = document.querySelectorAll(hoverSelectors);
                addHoverListeners(newLinks);
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}