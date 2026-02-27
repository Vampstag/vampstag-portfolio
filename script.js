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
    ScrollTrigger.config({ ignoreMobileResize: true });
    
    // 2. Navbar Logic (Scroll & Mobile)
    initNavbar();

    // 3. Render Projects
    // renderProjects(); // This function is for portfolio.html, not index.html

    // 4. Animations
    initInteractiveHero(); // Changed from initHeroAnimation

    // 5. Custom Cursor
    initCustomCursor();

    // 6. Bits Slider
    initBitsSlider();

    // 7. Lightbox
    initLightbox();

    // 8. FAQ Accordion
    initFAQ();

    // 10. Video Card Controls
    initVideoCards();

    // 11. Tab Title Switch
    initTabTitleSwitch();

    // 10. Refresh ScrollTrigger when preloader is done to ensure correct positions
    window.addEventListener('preloaderDone', () => {
        if (document.readyState === 'complete') {
            ScrollTrigger.refresh();
        } else {
            window.addEventListener('load', () => ScrollTrigger.refresh());
        }
    });
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
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const progressBar = document.getElementById('scroll-progress');
    let lastScrollTop = Math.max(0, window.scrollY);

    // -- Scroll Effect Logic --
    const handleScroll = () => {
        const currentScroll = window.scrollY;

        // 1. Shrink Effect (Class-based for performance)
        if (currentScroll > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 2. Smart Hide/Show (UX Optimization)
        // Hide when scrolling down (> 100px), Show when scrolling up
        // FIX: Don't hide navbar if mobile menu is currently open
        if (mobileOverlay && mobileOverlay.classList.contains('is-active')) {
            navbar.classList.remove('navbar-hidden');
        } else if (currentScroll > lastScrollTop && currentScroll > 100) {
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
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run immediately to set initial state

    // -- Mobile Menu Toggle Logic --
    if (menuBtn && mobileOverlay) {
        menuBtn.addEventListener('click', () => {
            const isActive = mobileOverlay.classList.toggle('is-active');
            menuBtn.classList.toggle('is-active');
            
            // Lock body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : 'auto';
            
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
 * Uses a single IntersectionObserver to handle all scroll-triggered animations
 * for better performance than multiple ScrollTriggers.
 */
function initObserverAnimations() {
    // Select all elements intended for scroll-based animations
    const animatedElements = document.querySelectorAll('.fade-in-section, .text-reveal');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Handle complex text reveal animation
                if (entry.target.classList.contains('text-reveal')) {
                    animateTextReveal(entry.target);
                } 
                // Handle specific Experience item animation
                else if (entry.target.classList.contains('experience-item')) {
                    animateExperienceItem(entry.target);
                }
                // Handle simple fade-in animations
                else {
                    entry.target.classList.add('is-visible');
                }
                // Stop observing the element after it has animated once
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger a bit earlier
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * Animates an experience item with a staggered effect.
 * This is more performant than the old hover-reveal and more interesting
 * than a simple fade-in.
 * @param {HTMLElement} item The .experience-item element to animate.
 */
function animateExperienceItem(item) {
    const title = item.querySelector('.experience-item__title');
    const company = item.querySelector('.experience-item__company');
    const meta = item.querySelector('.experience-item__meta');

    // Use a GSAP timeline for a controlled, staggered sequence
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.to(item, {
        opacity: 1,
        x: 0,
        duration: 0.8
    })
    .fromTo([title, company, meta], 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.6" // Overlap animations for a smoother effect
    );
}

/**
 * Helper function to run the GSAP text animation for headlines.
 * This is called by the IntersectionObserver.
 * @param {HTMLElement} element The .text-reveal element to animate.
 */
function animateTextReveal(element) {
    element.style.opacity = '1'; // Make container visible
    
    const text = element.innerText;
    const words = text.split(' ').filter(word => word.trim() !== '');
    element.innerHTML = '';

    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(30px)';
        if (index < words.length - 1) {
            span.style.marginRight = '0.25em';
        }
        element.appendChild(span);
    });

    gsap.to(element.children, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out"
    });
}

/**
 * Animates the NEW Interactive Hero section.
 */
function initInteractiveHero() {
    // 1. Register Draggable
    gsap.registerPlugin(Draggable);

    // Only enable Draggable on non-mobile screens (desktop) for better scroll experience
    if (window.matchMedia("(min-width: 992px)").matches) {
        // 2. Initialize Draggable on items
        Draggable.create(".drag-item", {
            type: "x,y",
            edgeResistance: 1,
            bounds: ".hero-playground-section",
            inertia: true,
            onPress: function() {
                const target = this.target;
                // Check if the item is the sticker to apply drop-shadow instead of box-shadow
                if (target.classList.contains('sticker-item')) {
                    const img = target.querySelector('img');
                    gsap.to(target, { scale: 1.05, zIndex: 100, duration: 0.2 });
                    gsap.to(img, { filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.2))", duration: 0.2 });
                } else if (target.classList.contains('sticker-icon')) {
                    gsap.to(target, { scale: 1.05, zIndex: 100, duration: 0.2, filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.15))" });
                } else {
                    gsap.to(target, { scale: 1.05, zIndex: 100, boxShadow: "0 30px 60px rgba(0,0,0,0.15)", duration: 0.2 });
                }
            },
            onRelease: function() {
                const target = this.target;
                // Revert to the appropriate shadow type
                if (target.classList.contains('sticker-item')) {
                    const img = target.querySelector('img');
                    gsap.to(target, { scale: 1, zIndex: 'auto', duration: 0.2 });
                    gsap.to(img, { filter: "drop-shadow(0 12px 15px rgba(0,0,0,0.1))", duration: 0.2 });
                } else if (target.classList.contains('sticker-icon')) {
                    gsap.to(target, { scale: 1, zIndex: 'auto', duration: 0.2, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.1))" });
                } else {
                    gsap.to(target, { scale: 1, zIndex: 'auto', boxShadow: "0 20px 40px rgba(0,0,0,0.1)", duration: 0.2 });
                }
            }
        });
    }

    // 3. Entrance Animation (Pop in elements)
    const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });
    
    // Animate Text First
    tl.fromTo(".hero-huge-title", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(".hero-subtitle, .hero-badge", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
    );

    // Animate Draggable Items (Staggered Pop)
    const items = document.querySelectorAll('.drag-item');
    if (items.length > 0) {
        tl.fromTo(items, 
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1 },
            "-=0.4"
        );
    }
    // Call the observer-based animations after the main hero is set up
    initObserverAnimations();
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

//#region TAB TITLE SWITCH
// =========================================
// 11. TAB TITLE SWITCH
// =========================================
/**
 * Changes the document title when the user switches to another tab
 * and restores it when they return.
 */
function initTabTitleSwitch() {
    const originalTitle = document.title;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.title = 'Hey, come back! 👋';
        } else {
            document.title = originalTitle;
        }
    });
}
//#endregion

//#region VIDEO CARD CONTROLS
// =========================================
// 10. VIDEO CARD CONTROLS
// =========================================
/**
 * Initializes mute/unmute controls for video cards.
 */
function initVideoCards() {
     const videoCards = document.querySelectorAll('.work-card');
 
     // 1. Intersection Observer for Play/Pause on Scroll
     const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             const video = entry.target.querySelector('.work-card__video');
             const muteBtn = entry.target.querySelector('.work-card__mute-btn');

             if (video) { 
                 if (entry.isIntersecting) {
                    // User Request: Always start muted when entering viewport
                    video.muted = true;

                    // Update icon to show mute state
                    if (muteBtn) {
                        muteBtn.classList.add('is-muted');
                    }

                     // Play the video
                     video.play().catch(error => {
                         console.log("Video autoplay was prevented by browser policy:", error);
                     });
                 } else {
                     // Pause the video when it leaves the viewport
                     video.pause();
                 }
             }
         });
     }, {
         root: null, // Observe intersections relative to the viewport
         threshold: 0.2 // Trigger when 20% of the element is visible
     });
 
     // 2. Initialize Each Card
     videoCards.forEach(card => {
         const video = card.querySelector('.work-card__video');
         const muteBtn = card.querySelector('.work-card__mute-btn');
 
         if (video) {
             // Observe the card for play/pause functionality
             observer.observe(card);
 
             // Add mute/unmute functionality if the button exists
             if (muteBtn) {
                 muteBtn.addEventListener('click', (e) => {
                     e.preventDefault(); // Prevent link navigation
                     e.stopPropagation(); // Stop event from bubbling to the card
 
                     video.muted = !video.muted;
                     // Toggle the class based on the video's muted state
                     muteBtn.classList.toggle('is-muted', video.muted);
                 });
             }
         }
     });
}
//#endregion

//#region LIGHTBOX
// =========================================
// 7. LIGHTBOX LOGIC
// =========================================
/**
 * Initializes the custom lightbox for the Bits Slider.
 * Why: Allows users to view slider images in full screen.
 */
function initLightbox() {
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".lightbox-close");
    const slider = document.querySelector('.bits-slider');

    if (!slider || !modal) return;

    // Add cursor pointer to images to indicate clickability
    const addCursor = () => {
        const images = slider.querySelectorAll('.photo-img');
        images.forEach(img => img.style.cursor = 'zoom-in');
    };
    addCursor();

    // Event Delegation: Handle clicks on images inside the slider
    slider.addEventListener('click', (e) => {
        const img = e.target.closest('.photo-img');
        if (img) {
            e.preventDefault();
            modal.classList.add('active');
            // Use currentSrc to get the highest quality loaded by the browser
            modalImg.src = img.currentSrc || img.src;
            document.body.style.overflow = 'hidden'; // Disable scroll
        }
    });

    // Close Logic
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scroll
        setTimeout(() => { modalImg.src = ''; }, 300); // Clear src after fade out
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Close on background click or Escape key
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && modal.classList.contains('active')) closeModal(); });
}
//#endregion

//#region FAQ
// =========================================
// 8. FAQ ACCORDION
// =========================================
function initFAQ() {
    const triggers = document.querySelectorAll('.faq__trigger');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const content = trigger.nextElementSibling;

            // Close others
            triggers.forEach(other => {
                if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
                    other.setAttribute('aria-expanded', 'false');
                    other.nextElementSibling.style.height = '0px';
                    other.nextElementSibling.setAttribute('aria-hidden', 'true');
                }
            });

            // Toggle current
            if (!isExpanded) {
                trigger.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
                content.style.height = content.scrollHeight + 'px';
            } else {
                trigger.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
                content.style.height = '0px';
            }
        });
    });
}
//#endregion