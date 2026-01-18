// =========================================
// 1. SWIPER SLIDER INITIALIZATION
// =========================================
var swiper = new Swiper('.swiper-container', {
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    spaceBetween: 20,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

// Initialize Bits and Pieces Swiper ONLY on Mobile
if (window.innerWidth < 992) {
    var bitsSwiper = new Swiper('.bits-swiper', {
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: true,
        spaceBetween: 20,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });
}

// =========================================
// 2. LAZY LOAD & SCROLL ANIMATIONS
// =========================================
document.addEventListener("DOMContentLoaded", function() {
    // Scroll animations for sections
    const sections = [].slice.call(document.querySelectorAll(".fade-in-section"));

    if ("IntersectionObserver" in window) {
        let sectionObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(function(section) {
            sectionObserver.observe(section);
        });
    } else {
        sections.forEach(function(section) {
            section.classList.add("is-visible");
        });
    }
});

// =========================================
// 3. LENIS SMOOTH SCROLL
// =========================================
window.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

// Stop scroll saat awal (karena ada preloader)
window.lenis.stop();

// Optimized Loop: Sync Lenis with GSAP Ticker
gsap.ticker.add((time) => {
    window.lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// =========================================
// 4. CUSTOM CURSOR & INTERACTION
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    // Cek jika bukan device touch (desktop)
    if (window.matchMedia("(min-width: 992px)").matches) {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);

        // Gerakkan cursor mengikuti mouse
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Efek membesar saat hover
        const hoverSelectors = 'a, button, .hover-trigger, img, .w-inline-block, .w-nav-button, input, textarea';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverSelectors)) {
                cursor.classList.add('hovered');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverSelectors)) {
                cursor.classList.remove('hovered');
            }
        });
    }

    // --- LOGIKA EFEK SUARA KLIK ---
    const clickSound = document.getElementById('click-sound');
    if (clickSound) {
        clickSound.volume = 0.4; 
        document.addEventListener('click', (e) => {
            if (e.target.closest('a, button, .hover-trigger, .w-inline-block')) {
                clickSound.currentTime = 0;
                clickSound.play().catch(() => {});
            }
        });
    }

    // --- LOGIKA TEXT REVEAL (GSAP) ---
    gsap.registerPlugin(ScrollTrigger);

    const revealElements = document.querySelectorAll('.text-reveal');

    revealElements.forEach(element => {
        const text = element.innerText;
        const words = text.trim().split(/\s+/); 
        element.innerHTML = ''; 
        
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';
            if (index < words.length - 1) wordSpan.style.marginRight = '0.25em';

            const chars = word.split('');
            chars.forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.innerText = char;
                charSpan.style.display = 'inline-block';
                charSpan.style.opacity = '0';
                charSpan.style.transform = 'translateY(40px) rotate(10deg)';
                charSpan.classList.add('char-anim');
                wordSpan.appendChild(charSpan);
            });
            
            element.appendChild(wordSpan);
        });

        gsap.to(element.querySelectorAll('.char-anim'), {
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 1,
            stagger: 0.02,
            ease: "back.out(1.7)"
        });
    });
});

// =========================================
// 5. SCROLL PROGRESS BAR
// =========================================
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = scrolled + "%";
    }
});

// =========================================
// 6. NAVBAR HIDE/SHOW ON SCROLL
// =========================================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar-3');
const statusWidget = document.querySelector('.live-status-widget');

if (navbar || statusWidget) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            if (navbar) navbar.classList.add('navbar-hidden');
            if (statusWidget) statusWidget.classList.add('widget-hidden');
        } else {
            if (navbar) navbar.classList.remove('navbar-hidden');
            if (statusWidget) statusWidget.classList.remove('widget-hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
}

// =========================================
// 7. MUSIC PLAYER WIDGET
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const player = document.getElementById('music-player');
    const audio = document.getElementById('bg-music');
    const text = player.querySelector('.player-text');
    const iconMuted = player.querySelector('.icon-muted');
    const iconPlaying = player.querySelector('.icon-playing');

    if (player && audio) {
        // Set volume to a comfortable level
        audio.volume = 0.4;

        player.addEventListener('click', () => {
            if (audio.paused) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        player.classList.add('playing');
                        if (text) text.innerText = "PAUSE";
                        if (iconMuted) iconMuted.style.display = 'none';
                        if (iconPlaying) iconPlaying.style.display = 'block';
                    }).catch(e => {
                        console.error("Audio playback failed:", e);
                    });
                }
            } else {
                audio.pause();
                player.classList.remove('playing');
                if (text) text.innerText = "PLAY";
                if (iconMuted) iconMuted.style.display = 'block';
                if (iconPlaying) iconPlaying.style.display = 'none';
            }
        });
    }
});

// =========================================
// 8. CLIPBOARD TOOLTIP INTERACTION
// =========================================
document.addEventListener('click', (e) => {
    // Target any mailto link (usually in footer)
    const mailLink = e.target.closest('a[href^="mailto:"]');
    
    if (mailLink) {
        e.preventDefault();
        const email = mailLink.getAttribute('href').replace('mailto:', '');
        
        navigator.clipboard.writeText(email).then(() => {
            showTooltip(mailLink, "Copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
});

// =========================================
// 9. PREMIUM MOBILE MENU ANIMATION
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const menuLinks = document.querySelectorAll('.mobile-link');
    const menuCta = document.querySelector('.mobile-cta');

    if (menuBtn && menuOverlay) {
        // Toggle Function
        const toggleMenu = () => {
            const isActive = menuOverlay.classList.contains('is-active');
            
            if (!isActive) {
                // OPEN
                menuOverlay.classList.add('is-active');
                menuBtn.classList.add('is-active');
                document.body.style.overflow = 'hidden';

                // Optional: GSAP Stagger for content entrance
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(menuLinks, 
                        { y: 40, opacity: 0 },
                        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.1 }
                    );
                    if (menuCta) {
                        gsap.fromTo(menuCta, 
                            { y: 20, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: "power2.out" }
                        );
                    }
                }
            } else {
                // CLOSE
                menuOverlay.classList.remove('is-active');
                menuBtn.classList.remove('is-active');
                document.body.style.overflow = '';
            }
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close when clicking links
        const closeMenu = () => {
            if (menuOverlay.classList.contains('is-active')) {
                toggleMenu();
            }
        };

        menuLinks.forEach(link => link.addEventListener('click', closeMenu));
        if (menuCta) menuCta.addEventListener('click', closeMenu);
    }
});

function showTooltip(element, message) {
    // Remove existing tooltip if any
    const existingTooltip = document.querySelector('.clipboard-tooltip');
    if (existingTooltip) existingTooltip.remove();

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'clipboard-tooltip';
    tooltip.innerText = message;
    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Center above the element
    const top = rect.top - tooltipRect.height - 12 + window.scrollY;
    const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + window.scrollX;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Animate in
    requestAnimationFrame(() => {
        tooltip.classList.add('visible');
    });

    // Remove after 2 seconds
    setTimeout(() => {
        tooltip.classList.remove('visible');
        setTimeout(() => tooltip.remove(), 400);
    }, 2000);
}
