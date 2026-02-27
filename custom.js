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
                initExperienceTilt(); // Initialize the new tilt effect
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
        const magneticButtons = document.querySelectorAll('.btn-primary, .button-normal-black-wrapper-2, .button-normal-white-wrapper-2, .work-card__cta');
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

        // --- 7. Experience Item 3D Tilt Effect ---
        function initExperienceTilt() {
            const experienceItems = document.querySelectorAll('.experience-item');

            experienceItems.forEach(item => {
                item.addEventListener('mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Calculate rotation based on mouse position relative to center
                    // Max rotation is set to 8 degrees for a subtle effect
                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;

                    gsap.to(item, {
                        rotationX: rotateX,
                        rotationY: rotateY,
                        scale: 1.03,
                        transformPerspective: 1000,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(item, {
                        rotationX: 0,
                        rotationY: 0,
                        scale: 1,
                        duration: 1,
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

});