//#region GLOBAL INITIALIZATION
// =========================================
// 1. CORE SETUP & EVENT LISTENERS
// =========================================
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
    window.lenis = lenis;

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

    // 5. Custom Cursor
    initCustomCursor();

    // 6. Bits Slider
    initBitsSlider();
});
//#endregion

//#region NAVBAR LOGIC
// =========================================
// 2. NAVBAR & MOBILE MENU
// =========================================
/**
 * Handles sticky navbar state and mobile menu toggling.
 * Why: To ensure navigation is accessible and provides visual feedback on scroll.
 */
function initNavbar() {
    // -- Selectors --
    const navbar = document.querySelector('.navbar-3');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const progressBar = document.getElementById('scroll-progress');
    let lastScrollTop = 0;

    // -- Scroll Effect Logic --
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        // 1. Shrink Effect (Class-based for performance)
        if (currentScroll > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 2. Smart Hide/Show (UX Optimization)
        // Hide when scrolling down (> 100px), Show when scrolling up
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll

        if (progressBar) {
            // Calculate scroll percentage for the top progress bar
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (scrollHeight > 0) {
                const scrolled = (currentScroll / scrollHeight) * 100;
                progressBar.style.width = `${scrolled}%`;
            } else {
                progressBar.style.width = '0%';
            }
        }
    });

    // -- Mobile Menu Toggle Logic --
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
//#endregion

//#region PORTFOLIO LOGIC
// =========================================
// 3. PROJECT RENDERING
// =========================================
/**
 * Dynamically renders project cards into the grid.
 * Why: Allows for easy updates to project data without touching HTML structure.
 */
function renderProjects() {
    const grid = document.getElementById('portfolio-grid');
    
    // Error Prevention: Check if grid or data exists
    if (!grid || typeof projectsData === 'undefined') return;

    grid.innerHTML = ''; // Clear existing

    try {
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
    } catch (error) {
        console.error("Error rendering projects:", error);
    }
}
//#endregion

//#region ANIMATIONS
// =========================================
// 4. GSAP ANIMATIONS
// =========================================
/**
 * Animates the hero section elements on load.
 */
function initHeroAnimation() {
    // -- Selectors --
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

/**
 * Sets up scroll-triggered animations for project cards.
 */
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

/**
 * Animates the footer when it comes into view.
 */
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
//#endregion

//#region CUSTOM CURSOR
// =========================================
// 5. CUSTOM CURSOR
// =========================================
/**
 * Creates and manages the custom cursor follower.
 * Why: Adds a premium feel to the desktop experience.
 */
function initCustomCursor() {
    // Disable on touch devices/mobile
    if (window.matchMedia("(max-width: 991px)").matches) return;

    // Error Prevention: Remove existing cursor if any to prevent duplicates
    const existingCursor = document.querySelector('.custom-cursor');
    if (existingCursor) existingCursor.remove();

    // -- Setup --
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // Set initial position off-screen to avoid jump
    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    // Use GSAP quickTo for high performance mouse following
    const xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3.out"});
    const yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3.out"});

    // -- Movement --
    window.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });

    // -- Hover Effects --
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

    // Observer for dynamic elements (e.g., portfolio items loaded via JS)
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
//#endregion

//#region BITS SLIDER
// =========================================
// 6. BITS & PIECES SLIDER
// =========================================
/**
 * Initializes the Swiper slider for the Bits and Pieces section.
 */
function initBitsSlider() {
    const slider = document.querySelector('.bits-slider');
    if (!slider || typeof Swiper === 'undefined') return;

    const swiper = new Swiper('.bits-slider', {
        loop: true,
        slidesPerView: "auto", // Allows CSS width to control how many show
        centeredSlides: true,
        spaceBetween: 20,
        grabCursor: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            768: {
                slidesPerView: "auto",
                spaceBetween: 30
            }
        }
    });

    // --- Tilt Effect Logic ---
    // Only applies to the active slide for a focused feel
    slider.addEventListener('mousemove', (e) => {
        const activeSlide = slider.querySelector('.swiper-slide-active');
        if (!activeSlide) return;

        const card = activeSlide.querySelector('.photo-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        
        // Check if mouse is inside the active card
        const isOver = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        );

        if (isOver) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate rotation (Max 10 degrees)
            const rotateX = ((mouseY - centerY) / centerY) * -10;
            const rotateY = ((mouseX - centerX) / centerX) * 10;

            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                scale: 1.02, // Subtle scale up
                transformPerspective: 1000,
                duration: 0.4,
                ease: "power2.out"
            });
        } else {
            // Reset if hovering slider but not the card
            gsap.to(card, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.5, ease: "power2.out" });
        }
    });

    // Reset on mouse leave
    slider.addEventListener('mouseleave', () => {
        const activeSlide = slider.querySelector('.swiper-slide-active');
        if (activeSlide) {
            const card = activeSlide.querySelector('.photo-card');
            if (card) gsap.to(card, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.5, ease: "power2.out" });
        }
    });
}
//#endregion