//#region GLOBAL INITIALIZATION
// =========================================
// 1. CORE SETUP & EVENT LISTENERS
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    // first, pull in shared navbar AND footer if placeholders exist
    Promise.all([loadNavbar(), loadFooter()]).then(() => {
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

        // --- GSAP & SCROLLTRIGGER INTEGRATION ---
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });

        // Connect Lenis to ScrollTrigger. This is the crucial part.
        lenis.on('scroll', ScrollTrigger.update);

        // [FIX] Handle anchor links smoothly with Lenis (Fixes Back to Top jump)
        // Intercepts clicks on hash links and uses Lenis to scroll smoothly
        // Menggunakan parameter 'true' (Capture Phase) untuk mencegat klik sebelum script Webflow berjalan
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"], .back-to-top');
            if (link) {
                const targetId = link.getAttribute('href');
                
                // Skenario "Back to Top" (Class .back-to-top, atau href "#", atau href "#top")
                if (link.classList.contains('back-to-top') || targetId === '#' || targetId === '#top') {
                    e.preventDefault();
                    e.stopPropagation(); // Mencegah Webflow ikut mengatur scroll
                    lenis.scrollTo(0, { 
                        duration: 1.5, // Durasi scroll lebih lambat dan mewah
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) // Curve easing halus
                    });
                } 
                // Skenario anchor section normal (contoh: #about, #portfolio)
                else if (targetId && targetId.startsWith('#') && document.querySelector(targetId)) {
                    e.preventDefault();
                    e.stopPropagation(); // Mencegah Webflow ikut mengatur scroll
                    lenis.scrollTo(targetId, { duration: 1.2 });
                }
            }
        }, true);

        // Ensure GSAP animations are synchronized with Lenis's render loop.
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        
        // OPTIMIZED: Dihapus agar GSAP bisa menangani frame-drop dengan lebih halus

        // 2. Navbar Logic (Scroll & Mobile)
        initNavbar();

        // 3. Render Projects
        // renderProjects(); // This function is for portfolio.html, not index.html

        // 4. Animations
        initInteractiveHero(); // Changed from initHeroAnimation

        // 6. Lazy Load Bits Slider (Hanya jalankan Swiper saat elemen mendekati viewport)
        const bitsSliderEl = document.querySelector('.bits-slider');
        if (bitsSliderEl && typeof IntersectionObserver !== 'undefined') {
            const sliderObserver = new IntersectionObserver((entries, obs) => {
                if (entries[0].isIntersecting) {
                    initBitsSlider();
                    obs.disconnect(); // Hentikan observasi setelah slider berhasil dibuat
                }
            }, { rootMargin: "300px 0px" }); // Trigger 300px sebelum masuk layar
            sliderObserver.observe(bitsSliderEl);
        } else if (bitsSliderEl) {
            initBitsSlider(); // Fallback
        }

        // 7. Lightbox
        initLightbox();

        // 8. FAQ Accordion
        initFAQ();

        // 10. Video Card Controls
        initVideoCards();

        // 11. Tab Title Switch
        initTabTitleSwitch();

        // 12. Constant Marquee Speed
        initMarqueeSpeed();

        // 13. Data Validation Counter
        initDataCounter();

        // 14. Data Parallax
        initDataParallax();

        // 15. Audio Narrator
        initAudioNarrator();

        // 10. Refresh ScrollTrigger when preloader is done to ensure correct positions
        window.addEventListener('preloaderDone', () => {
            if (document.readyState === 'complete') {
                ScrollTrigger.refresh();
            } else {
                window.addEventListener('load', () => ScrollTrigger.refresh());
            }
        });
    });
});

// helper: load navbar html into placeholder, returns a promise that resolves after injection
function loadNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return Promise.resolve();
    // choose path relative to current location; case study pages are one level deep
    let url = 'navbar.html';
    if (window.location.pathname.includes('/case-study/') || window.location.pathname.includes('/study-case/')) {
        url = '../navbar.html';
    }
    return fetch(url)
        .then(resp => resp.text())
        .then(html => {
            container.innerHTML = html;

            // fix relative link paths when the page is inside a subfolder
            if (window.location.pathname.includes('/case-study/') || window.location.pathname.includes('/study-case/')) {
                container.querySelectorAll('a').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('../')) {
                        link.setAttribute('href', '../' + href);
                    }
                });
            }

            // If Webflow interactions are used inside navbar we need to re-init them
            if (window.Webflow) {
                Webflow.destroy();
                Webflow.ready();
                if (Webflow.require && Webflow.require('ix2')) {
                    Webflow.require('ix2').init();
                }
            }

            if (window.ScrollTrigger) {
                ScrollTrigger.refresh();
            }
        })
        .catch(err => {
            console.error('Failed to load navbar:', err);
        });
}

// helper: load footer html into placeholder
function loadFooter() {
    const container = document.getElementById('footer-container');
    // Don't interfere if the page has its own preloader logic (like index.html) that loads footer
    if (!container || document.getElementById('preloader')) return Promise.resolve();

    let url = 'footer.html';
    const isSubPage = window.location.pathname.includes('/case-study/') || window.location.pathname.includes('/study-case/');
    
    if (isSubPage) {
        url = '../footer.html';
    }

    return fetch(url)
        .then(resp => resp.text())
        .then(html => {
            // [FIX] Bersihkan atribut data Webflow dari footer untuk mematikan animasi lawas
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            tempDiv.querySelectorAll('[data-w-id]').forEach(el => el.removeAttribute('data-w-id'));

            container.innerHTML = tempDiv.innerHTML;

            // Fix relative paths for links and images in footer
            if (isSubPage) {
                container.querySelectorAll('a, img').forEach(el => {
                    const href = el.getAttribute('href');
                    const src = el.getAttribute('src');
                    // Fix links that are relative (not http, mailto, hash, or already corrected)
                    if (href && !href.match(/^(http|#|mailto:|\.\.\/)/)) el.setAttribute('href', '../' + href);
                    if (src && !src.match(/^(http|data:|\.\.\/)/)) el.setAttribute('src', '../' + src);
                });
            }

            // [MATCH HOME] Use requestAnimationFrame for consistent timing
            requestAnimationFrame(() => {
                // 1. Re-initialize Webflow Interactions (Diaktifkan kembali untuk fitur halaman lain, footer aman karena atributnya sudah dicopot)
                if (window.Webflow) {
                    Webflow.destroy(); 
                    Webflow.ready();
                    if (Webflow.require && Webflow.require('ix2')) {
                        Webflow.require('ix2').init();
                    }
                }

                // 2. Universal Premium Footer Animation
                if (typeof window.initFooterGSAP === 'function') {
                    window.initFooterGSAP();
                }

                // 3. Refresh ScrollTrigger
                if (window.ScrollTrigger) {
                    ScrollTrigger.refresh();
                }
            });
        })
        .catch(err => {
            console.error('Failed to load footer:', err);
        });
}

// [NEW] Universal Premium Footer Entry Animation
window.initFooterGSAP = function() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    // Cari elemen pembungkus (kolom atau grid) di dalam footer untuk di-stagger
    let targets = footerContainer.querySelectorAll('.w-layout-grid > div, .footer-column, .footer-wrapper > div, .footer-main-block > div');
    
    // Fallback jika class spesifik tidak ditemukan
    if (!targets || targets.length === 0) {
        targets = footerContainer.firstElementChild;
    }

    gsap.fromTo(targets, 
        { y: 50, opacity: 0 },
        {
            y: 0, 
            opacity: 1, 
            duration: 1.2, 
            stagger: 0.1, 
            ease: "power3.out",
            scrollTrigger: {
                trigger: footerContainer,
                start: "top 95%", // Memicu animasi ketika bagian atas footer baru terlihat 5%
                once: true
            }
        }
    );
};
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
function initObserverAnimations(context = document) {
    // Select all elements intended for scroll-based animations
    const animatedElements = context.querySelectorAll('.fade-in-section, .text-reveal');

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
        if (el.dataset.observed) return; // Prevent double observation
        el.dataset.observed = "true";
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
            onDrag: function() {
                // Efek ayunan fisik (tilt) berdasarkan kecepatan tarik (deltaX)
                const target = this.target;
                const tilt = Math.max(-15, Math.min(15, this.deltaX * 0.4));
                gsap.to(target, { rotation: target._baseRotation + tilt, duration: 0.5, ease: "power2.out", overwrite: "auto" });
            },
            onPress: function() {
                const target = this.target;
                
                // Simpan rotasi asli elemen dari CSS sebelum diubah-ubah
                target._baseRotation = gsap.getProperty(target, "rotation") || 0;

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
                
                // Kembalikan ke rotasi asli dengan efek memantul (elastic)
                gsap.to(target, { rotation: target._baseRotation, ease: "elastic.out(1, 0.4)", duration: 1, overwrite: "auto" });

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
        { y: 80, opacity: 0, filter: "blur(24px)", scale: 0.95 },
        { y: 0, opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.8, ease: "power4.out" }
    )
    .fromTo(".hero-subtitle, .hero-badge", 
        { y: 30, opacity: 0, filter: "blur(12px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out" },
        "-=1.4"
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
        speed: 800, // Cinematic smooth sliding speed
        keyboard: { enabled: true }, // Aksesibilitas navigasi via keyboard
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
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
                scale: 1.03, // Cinematic slightly bigger zoom
                transformPerspective: 1200,
                duration: 0.6,
                ease: "power3.out"
            });
        } else {
            // Reset if hovering slider but not the card
            gsap.to(card, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.8, ease: "power3.out" });
        }
    });

    // Reset on mouse leave
    slider.addEventListener('mouseleave', () => {
        const activeSlide = slider.querySelector('.swiper-slide-active');
        if (activeSlide) {
            const card = activeSlide.querySelector('.photo-card');
            if (card) gsap.to(card, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.8, ease: "power3.out" });
        }
    });
}
//#endregion

//#region AUDIO NARRATOR
// =========================================
// 15. AUDIO NARRATOR PLAYER
// =========================================
function initAudioNarrator() {
    const wrapper = document.querySelector('.audio-narrator-wrapper');
    const player = document.querySelector('.audio-player-container');
    if (!player || !wrapper) return;

    const audio = player.querySelector('audio');
    const playBtn = player.querySelector('.play-pause-btn');
    const iconPlay = playBtn.querySelector('.icon-play');
    const iconPause = playBtn.querySelector('.icon-pause');
    const progressContainer = player.querySelector('.audio-progress-container');
    const timeCurrent = player.querySelector('.audio-time-current');
    const timeTotal = player.querySelector('.audio-time-total');
    const speedBtn = player.querySelector('.speed-btn');

    // --- WEB AUDIO API VARIABLES ---
    let audioCtx, analyser, dataArray, source;
    let animationId;
    const staticHeights = []; // To store original waveform shape for pause state

    // --- WAVEFORM GENERATION ---
    // Bersihkan container lama dan siapkan mode waveform
    progressContainer.innerHTML = '';
    progressContainer.classList.add('waveform-mode');

    // [FIX] Kurangi jumlah bar di mobile agar tidak overflow/kepotong (60 desktop, 28 mobile)
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const barCount = isMobile ? 28 : 60; 
    const bars = [];
    
    // Buat batang-batang visualizer
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.classList.add('waveform-bar');
        // Random tinggi antara 25% sampai 100% untuk efek gelombang suara natural
        // Kita simpan height statis ini untuk dipakai saat pause
        const height = Math.floor(Math.random() * 60) + 20; 
        staticHeights.push(height);
        
        bar.style.height = `${height}%`;
        progressContainer.appendChild(bar);
        bars.push(bar);
    }

    // Tambahkan kembali tooltip (karena innerHTML dihapus)
    const tooltip = document.createElement('div');
    tooltip.classList.add('audio-tooltip');
    tooltip.textContent = "0:00";
    progressContainer.appendChild(tooltip);

    // Helper: Format time
    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    // --- AUDIO CONTEXT SETUP (Lazy Load) ---
    const initAudioContext = () => {
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
                
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 128; // Balance between detail and performance
                
                // Create Source from HTML Audio Element
                source = audioCtx.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } catch (error) {
            console.warn("Web Audio API blocked by CORS/Browser policy. Playing basic audio.", error);
        }
    };

    // --- VISUALIZER LOOP ---
    const renderVisualizer = () => {
        if (audio.paused) return;
        
        animationId = requestAnimationFrame(renderVisualizer);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate sampling step to map 64 bins to 'barCount' bars
        // We focus on the lower-mid spectrum where most musical energy is
        const step = Math.ceil(dataArray.length / barCount);

        bars.forEach((bar, i) => {
            // Get frequency value
            const dataIndex = Math.min(i * step, dataArray.length - 1);
            const value = dataArray[dataIndex];
            
            // Map 0-255 to percentage height (min 15% so it's visible)
            const percent = (value / 255) * 100;
            const height = Math.max(percent, 15);
            
            bar.style.height = `${height}%`;
        });
    };

    const resetVisualizer = () => {
        cancelAnimationFrame(animationId);
        // Restore the "aesthetic" random waveform when paused
        bars.forEach((bar, i) => {
            bar.style.height = `${staticHeights[i]}%`;
        });
    };

    // Toggle Play/Pause
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            // Init Web Audio on first user interaction
            initAudioContext();
            
            // Play with Fade In
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audio.volume = 1; // FIX: Hapus GSAP Volume fade karena memblokir audio di iOS/Desktop
                    
                    iconPlay.style.display = 'none';
                    iconPause.style.display = 'block';
                    player.classList.add('is-playing');
                    
                    updateStickyState(); // FIX: Langsung cek state sticky sesaat sesudah play
                    // Start Visualizer
                    renderVisualizer();
                }).catch((e) => {
                    console.warn("Audio play failed:", e);
                });
            }
        } else {
            // Fade Out then Pause
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
            player.classList.remove('is-playing');
            
            resetVisualizer();
            audio.pause();
            audio.volume = 1;
            updateStickyState(); // FIX: Cek state sticky sesaat sesudah pause
        }
    });

    // Update Progress & Time
    audio.addEventListener('timeupdate', () => {
        const percent = audio.currentTime / audio.duration;
        
        // Update Active Class (Coloring) based on Time
        const activeIndex = Math.floor(percent * barCount);
        bars.forEach((bar, index) => {
            if (index <= activeIndex) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });

        timeCurrent.textContent = formatTime(audio.currentTime);
    });

    // Set Duration on Load
    const setDuration = () => {
        if (!isNaN(audio.duration) && isFinite(audio.duration)) {
            timeTotal.textContent = formatTime(audio.duration);
        }
    };

    if (audio.readyState >= 1) setDuration();
    audio.addEventListener('loadedmetadata', setDuration);

    // Seek/Scrub
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    });

    // Tooltip Hover Logic
    progressContainer.addEventListener('mousemove', (e) => {
        const width = progressContainer.clientWidth;
        const hoverX = e.offsetX;
        const duration = audio.duration;
        if (!duration) return;
        
        const hoverTime = (hoverX / width) * duration;
        if (tooltip) {
            tooltip.textContent = formatTime(hoverTime);
            tooltip.style.left = `${hoverX}px`;
        }
    });

    // Speed Control
    const speeds = [1, 1.25, 1.5];
    let speedIndex = 0;
    speedBtn.addEventListener('click', () => {
        speedIndex = (speedIndex + 1) % speeds.length;
        audio.playbackRate = speeds[speedIndex];
        speedBtn.textContent = speeds[speedIndex] + 'x';
    });

    // Reset UI on End
    audio.addEventListener('ended', () => {
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        // Reset visual state
        resetVisualizer();
        bars.forEach(bar => bar.classList.remove('active'));
        player.classList.remove('is-playing');
        audio.volume = 1; // Reset volume for next play
        updateStickyState(); // Tambahkan ini agar sticky hilang otomatis saat lagu tamat
    });

    // [NEW] Sticky Player Logic
    // Set height wrapper agar layout tidak jumping saat player jadi fixed
    wrapper.style.minHeight = player.offsetHeight + 'px';

    let isWrapperVisible = true;

    // Helper untuk update sticky kapan saja (saat play ditekan, atau saat scroll)
    const updateStickyState = () => {
        // Syarat diubah: Muncul asalkan tidak di layar atas DAN audio sudah jalan tapi belum tamat
        if (!isWrapperVisible && audio.currentTime > 0 && !audio.ended) {
            player.classList.add('is-sticky');
        } else {
            player.classList.remove('is-sticky');
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Wrapper dianggap "terlihat" jika intersect ATAU masih berada di bawah layar (belum terlewat)
            isWrapperVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
            updateStickyState();
        });
    }, { 
        threshold: 0,
        rootMargin: "0px 0px 0px 0px"
    });

    observer.observe(wrapper);
}
//#endregion

//#region DATA PARALLAX
// =========================================
// 14. DATA PARALLAX ANIMATION
// =========================================
function initDataParallax() {
    const numbers = document.querySelectorAll('.data-number');
    
    if (!numbers.length) return;

    numbers.forEach(number => {
        gsap.fromTo(number, 
            { yPercent: -15 }, // Start slightly shifted up
            {
                yPercent: 15, // Move down as user scrolls (creating "lag" behind scroll)
                ease: "none",
                scrollTrigger: {
                    trigger: number.closest('.data-validation-section') || number,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.5 // Smooth scrubbing
                }
            }
        );
    });
}
//#endregion

//#region DATA COUNTER
// =========================================
// 13. DATA COUNTER ANIMATION
// =========================================
function initDataCounter() {
    const counters = document.querySelectorAll('.data-number');
    
    counters.forEach(counter => {
        // Regex to split: Prefix (non-digits), Number (digits/dots/commas), Suffix (non-digits)
        // Handles formats like "+1M", "3+", "100%"
        const text = counter.innerText;
        const match = text.match(/^([^0-9]*)([0-9\.,]+)([^0-9]*)$/);
        
        if (match) {
            const prefix = match[1];
            // Remove commas for numeric parsing (e.g. 1,000 -> 1000)
            const numericString = match[2].replace(/,/g, '');
            const targetVal = parseFloat(numericString);
            const suffix = match[3];
            
            // Detect if original number had decimals
            const hasDecimals = match[2].includes('.');
            const decimals = hasDecimals ? match[2].split('.')[1].length : 0;
            
            // Initial state: Show 0 with prefix/suffix
            counter.innerText = `${prefix}0${suffix}`;
            
            const proxy = { val: 0 };
            
            // Select the corresponding label
            const label = counter.parentElement.querySelector('.data-label');
            if (label) gsap.set(label, { opacity: 0 }); // Hide initially

            gsap.to(proxy, {
                val: targetVal,
                duration: 2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: counter,
                    start: "top 85%", // Animation starts when element is near bottom of viewport
                    once: true // Animate only once
                },
                onStart: () => {
                    // Animate label fade-in with a slight delay
                    if (label) {
                        gsap.fromTo(label, 
                            { opacity: 0, y: 15 },
                            { opacity: 0.6, y: 0, duration: 1, ease: "power3.out", delay: 0.4 }
                        );
                    }
                },
                onUpdate: () => {
                    // Format current value
                    let current;
                    if (hasDecimals) {
                        current = proxy.val.toFixed(decimals);
                    } else {
                        current = Math.floor(proxy.val);
                        // Add commas back for integer display if needed
                        current = current.toLocaleString('en-US');
                    }
                    counter.innerText = `${prefix}${current}${suffix}`;
                },
                onComplete: () => {
                    // Ensure it ends exactly on the original string
                    counter.innerText = text;
                }
            });
        }
    });
}
//#endregion

//#region MARQUEE SPEED
// =========================================
// 12. MARQUEE SPEED CONTROL
// =========================================
function initMarqueeSpeed() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;

    // CONFIG: Kecepatan dalam pixels per detik
    // 50-60 adalah kecepatan yang nyaman dibaca.
    // Semakin KECIL angka ini = Semakin LAMBAT.
    const pixelsPerSecond = 50; 

    const updateDuration = () => {
        // Ambil lebar total track saat ini (fit-content menyesuaikan isi)
        const trackWidth = track.offsetWidth;
        // Jarak tempuh animasi CSS kita adalah -50% (setengah lebar total)
        const distance = trackWidth / 2;
        
        if (distance > 0) {
            // Rumus Fisika: Waktu = Jarak / Kecepatan
            const duration = distance / pixelsPerSecond;
            track.style.animationDuration = `${duration}s`;
        }
    };

    // Hitung saat loading awal
    requestAnimationFrame(updateDuration);

    // Hitung ulang jika layar di-resize (responsif)
    window.addEventListener('resize', updateDuration);
    
    // Hitung ulang saat gambar selesai loading (karena width gambar auto)
    track.querySelectorAll('img').forEach(img => {
        if (img.complete) updateDuration();
        else img.addEventListener('load', updateDuration);
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
    const favicon = document.getElementById('favicon');

    if (!favicon) return; // Exit if favicon element is not found

    const originalFavicon = favicon.href;
    // NOTE: You need to create this 'away' favicon image and place it in the correct path.
    const awayFavicon = 'assets/images/favicon-away.png'; 

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.title = 'Hey, come back! 👋';
            favicon.href = awayFavicon;
        } else {
            document.title = originalTitle;
            favicon.href = originalFavicon;
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
     
     // Check connection status (Progressive Enhancement)
     const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
     const isSaveData = connection ? connection.saveData : false;
 
     // 1. Intersection Observer for Play/Pause on Scroll
     const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             const video = entry.target.querySelector('.work-card__video');
             const muteBtn = entry.target.querySelector('.work-card__mute-btn');

             if (video) { 
                 if (entry.isIntersecting) {
                    // Skip autoplay if Data Saver is on
                    if (isSaveData) return;

                    // User Request: Always start muted when entering viewport
                    video.muted = true;

                    // Update icon to show mute state
                    if (muteBtn) {
                        muteBtn.classList.add('is-muted');
                    }

                     // Play the video
                     const playPromise = video.play();
                     if (playPromise !== undefined) {
                         playPromise.catch(error => {
                         console.log("Video autoplay was prevented by browser policy:", error);
                     });
                     }
                 } else {
                     // Pause the video when it leaves the viewport
                     if (!video.paused) {
                         video.pause();
                     }
                 }
             }
         });
     }, {
         root: null, // Observe intersections relative to the viewport
         threshold: 0.2, // Trigger when 20% of the element is visible
         rootMargin: "200px 0px" // Preload slightly before element enters viewport
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