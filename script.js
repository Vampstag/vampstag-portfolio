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
    // Lazy load images
    const lazyImages = [].slice.call(document.querySelectorAll("img.lazy-image"));

    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    if (lazyImage.dataset.srcset) {
                        lazyImage.srcset = lazyImage.dataset.srcset;
                    }
                    lazyImage.classList.add("is-loaded");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Fallback
        lazyImages.forEach(function(lazyImage) {
            lazyImage.src = lazyImage.dataset.src;
            if (lazyImage.dataset.srcset) {
                lazyImage.srcset = lazyImage.dataset.srcset;
            }
            lazyImage.classList.add("is-loaded");
        });
    }

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

function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

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

if (navbar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
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
