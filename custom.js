//#region INITIALIZATION
document.addEventListener("DOMContentLoaded", (event) => {
    // Register GSAP Plugins

    // -- Global Selectors --

    // Responsive Logic using gsap.matchMedia()
    const mm = gsap.matchMedia();
//#endregion

    //#region DESKTOP LOGIC (>= 992px)
    // =========================================
    // DESKTOP INTERACTIONS
    // =========================================
    mm.add("(min-width: 992px)", () => {
        
        // Optimized Initialization: Wait for Window Load + Preloader to prevent layout shifts
        const startSequence = () => {
            if (document.readyState === 'complete') {
                initFooterMagnetic();
            } else {
                window.addEventListener('load', initFooterMagnetic);
            }
        };

        if (document.body.classList.contains('preloader-active')) {
            window.addEventListener('preloaderDone', startSequence, { once: true });
        } else {
            startSequence();
        }

        // --- 4. Magnetic Button Effect ---
        const magneticButtons = document.querySelectorAll('.btn-primary, .button-normal-black-wrapper-2, .button-normal-white-wrapper-2');
        magneticButtons.forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.5, 
                    y: y * 0.5,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });

        // --- 6. Footer Magnetic Links ---
        function initFooterMagnetic() {
            // Select links within the footer container (loaded dynamically)
            const footerLinks = document.querySelectorAll('#footer-container a');
            
            footerLinks.forEach((link) => {
                link.addEventListener('mousemove', (e) => {
                    const rect = link.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    gsap.to(link, {
                        x: x * 0.3, 
                        y: y * 0.3,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });

                link.addEventListener('mouseleave', () => {
                    gsap.to(link, {
                        x: 0,
                        y: 0,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.3)"
                    });
                });
            });
        }
    });
    //#endregion

    //#region MOBILE LOGIC (< 992px)
    // =========================================
    // MOBILE INTERACTIONS
    // =========================================
    mm.add("(max-width: 991px)", () => {

        
        // DISABLED DRAGGABLE ON MOBILE/TABLET
        // DRAGGABLE DISABLED ON MOBILE/TABLET FOR BETTER SCROLL UX
    });
    //#endregion

    // --- 5. Experience Image Reveal (Hover Effect) - GLOBAL ---
    function initExperienceReveal() {
        // Create the reveal image element dynamically
        const revealImg = document.createElement('img');
        revealImg.classList.add('experience-reveal-img');
        document.body.appendChild(revealImg);

        // Center the image on the cursor initially
        gsap.set(revealImg, { 
            position: "fixed", 
            top: 0, 
            left: 0, 
            pointerEvents: "none", 
            zIndex: 9999,
            xPercent: -50, 
            yPercent: -50,
            autoAlpha: 0,
            maxWidth: "300px" // Ensure image isn't too large
        });

        const experienceItems = document.querySelectorAll('.experience-section .home-services-card-wrapper');
        
        // Use quickTo for high-performance mouse following
        const xTo = gsap.quickTo(revealImg, "x", {duration: 0.5, ease: "power3.out"});
        const yTo = gsap.quickTo(revealImg, "y", {duration: 0.5, ease: "power3.out"});

        // --- Event Handlers ---
        const onMouseEnter = (e) => {
            const item = e.currentTarget;
            const imgUrl = item.getAttribute('data-reveal-img');
            if (imgUrl) {
                revealImg.src = imgUrl;
                gsap.to(revealImg, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.4,
                    overwrite: 'auto'
                });
            }
        };

        const onMouseMove = (e) => {
            const item = e.currentTarget;
            xTo(e.clientX);
            yTo(e.clientY);
            
            // Calculate velocity and speed
            const xVel = e.movementX || 0;
            const yVel = e.movementY || 0;
            const speed = Math.sqrt(xVel * xVel + yVel * yVel);

            // Clamp rotation to keep it subtle (e.g., max 15 degrees)
            const rotationVal = gsap.utils.clamp(-15, 15, xVel * 0.8);
            
            // Map speed to scale (Base 1, Max 1.15) - grows when moving fast
            const scaleVal = gsap.utils.clamp(1, 1.15, 1 + speed * 0.005);

            gsap.to(revealImg, {
                rotation: rotationVal,
                scale: scaleVal,
                duration: 0.5,
                ease: "power2.out",
                overwrite: 'auto',
                force3D: true
            });

            // Magnetic Effect on List Item
            const rect = item.getBoundingClientRect();
            const xDist = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
            const yDist = (e.clientY - (rect.top + rect.height / 2)) * 0.15;

            gsap.to(item, {
                x: xDist,
                y: yDist,
                duration: 0.3,
                ease: "power2.out"
            });
        };

        const onMouseLeave = (e) => {
            const item = e.currentTarget;
            gsap.to(revealImg, {
                autoAlpha: 0,
                scale: 0.8,
                filter: 'blur(0px)',
                duration: 0.3,
                overwrite: 'auto'
            });

            // Reset Magnetic Effect
            gsap.to(item, {
                x: 0,
                y: 0,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        };

        // --- Apply Logic via MatchMedia ---
        
        // Desktop: Hover & Trail
        mm.add("(min-width: 992px)", () => {
            experienceItems.forEach(item => {
                item.addEventListener('mouseenter', onMouseEnter);
                item.addEventListener('mousemove', onMouseMove);
                item.addEventListener('mouseleave', onMouseLeave);
            });
            return () => {
                experienceItems.forEach(item => {
                    item.removeEventListener('mouseenter', onMouseEnter);
                    item.removeEventListener('mousemove', onMouseMove);
                    item.removeEventListener('mouseleave', onMouseLeave);
                });
            };
        });

    }
    initExperienceReveal();
});