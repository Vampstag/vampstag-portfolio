//#region INITIALIZATION
document.addEventListener("DOMContentLoaded", (event) => {
    // Register GSAP Plugins
    gsap.registerPlugin(Draggable);

    // -- Global Selectors --
    const heroCards = document.querySelectorAll('.hero-card');
    const middleCard = document.querySelector('.home-hero-image-card-wrapper-02');

    // Responsive Logic using gsap.matchMedia()
    const mm = gsap.matchMedia();
//#endregion

    //#region DESKTOP LOGIC (>= 992px)
    // =========================================
    // DESKTOP INTERACTIONS
    // =========================================
    mm.add("(min-width: 992px)", () => {
        
        // --- 1. Entrance Animation (Slide In from Bottom) ---
        // Set initial state: Below screen, hidden
        gsap.set(heroCards, {
            y: 100, // Slide up 100px
            autoAlpha: 0
        });

        // Define the Slide Animation
        const runEntranceAnimation = () => {
            gsap.to(heroCards, {
                y: 0,
                autoAlpha: 1,
                duration: 1.2,
                ease: "power3.out", // Smooth slide
                stagger: 0.1,
                onComplete: () => {
                    // Clear transform to ensure Draggable starts from a clean state (0,0)
                    gsap.set(heroCards, { clearProps: "transform" });
                    initDesktopDraggable();
                    initParallaxEffect();
                }
            });
        };

        // Check if Preloader is active
        if (document.body.classList.contains('preloader-active')) {
            // Wait for preloader to finish
            window.addEventListener('preloaderDone', runEntranceAnimation, { once: true });
        } else {
            // Run immediately if no preloader
            runEntranceAnimation();
        }

        // --- 2. Draggable Physics (Elastic Toss) ---
        function initDesktopDraggable() {
            Draggable.create(heroCards, {
                type: "x,y",
                edgeResistance: 0.65,
                bounds: window,
                
                onPress: function() {
                    // Scale up and bring to front
                    gsap.to(this.target, { 
                        scale: 1.05, 
                        rotationX: 0, // Flatten 3D effect when held
                        rotationY: 0,
                        duration: 0.2, 
                        zIndex: 100 
                    });
                },
                
                onDrag: function() {
                    // Dynamic rotation based on drag movement (Paper physics)
                    gsap.to(this.target, {
                        rotation: this.x * 0.05,
                        duration: 0.1,
                        overwrite: "auto"
                    });
                },

                onRelease: function() {
                    // Snap back to origin with strong spring effect
                    gsap.to(this.target, {
                        x: 0,
                        y: 0,
                        rotation: 0,
                        scale: 1,
                        zIndex: 1, // Reset z-index
                        duration: 1.2,
                        ease: "elastic.out(1, 0.4)",
                        overwrite: "auto"
                    });
                }
            });
        }

        // --- 3. Parallax Effect (Scatter on Mouse Move) ---
        function initParallaxEffect() {
            // Listen to mouse movement on the whole window
            window.addEventListener("mousemove", (e) => {
                // Calculate normalized mouse position (-1 to 1)
                const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
                const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;

                // Helper to apply parallax if not dragging
                const applyParallax = (card, xFactor, yFactor) => {
                    if (card && !Draggable.get(card)?.isDragging) {
                        gsap.to(card, {
                            xPercent: xRatio * xFactor,
                            yPercent: yRatio * yFactor,
                            rotationY: xRatio * 8, // 3D Tilt Y
                            rotationX: -yRatio * 8, // 3D Tilt X
                            transformPerspective: 500, // Add depth perspective
                            duration: 1,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    }
                };

                // Apply different factors to create a "scatter" feel
                
                // Card 1 (Left): Moves slightly opposite to mouse
                applyParallax(heroCards[0], -3, -3);

                // Card 2 (Center): Moves with mouse
                applyParallax(heroCards[1], 5, 5);
                // applyParallax(heroCards[1], 5, 5);

                // Card 3 (Right): Moves more aggressively opposite
                applyParallax(heroCards[2], -8, -8);
            });
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

        // --- 5. Experience Image Reveal (Hover Effect) ---
        function initExperienceReveal() {
            // Create the reveal image element dynamically
            const revealImg = document.createElement('img');
            revealImg.classList.add('experience-reveal-img');
            document.body.appendChild(revealImg);

            // Center the image on the cursor initially
            gsap.set(revealImg, { xPercent: -50, yPercent: -50 });

            const experienceItems = document.querySelectorAll('.experience-section .home-services-card-wrapper');
            
            // Use quickTo for high-performance mouse following
            const xTo = gsap.quickTo(revealImg, "x", {duration: 0.5, ease: "power3.out"});
            const yTo = gsap.quickTo(revealImg, "y", {duration: 0.5, ease: "power3.out"});

            experienceItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
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
                });

                item.addEventListener('mousemove', (e) => {
                    xTo(e.clientX);
                    yTo(e.clientY);
                    
                    // Add slight rotation based on movement velocity for a "floating" feel
                    const xVel = e.movementX || 0;
                    gsap.to(revealImg, {
                        rotation: xVel * 0.5,
                        duration: 0.5,
                        overwrite: 'auto'
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
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(revealImg, {
                        autoAlpha: 0,
                        scale: 0.8,
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
                });
            });
        }
        initExperienceReveal();
    });
    //#endregion

    //#region MOBILE LOGIC (< 992px)
    // =========================================
    // MOBILE INTERACTIONS
    // =========================================
    mm.add("(max-width: 991px)", () => {
        // Ensure cards are visible and reset if coming from desktop resize
        gsap.set(heroCards, { autoAlpha: 1, y: 0, rotation: 0, clearProps: "transform" });
        // Also clear transforms to fix any potential layout glitches
        gsap.set(heroCards, { autoAlpha: 1, y: 0, rotation: 0, clearProps: "all" });

        
        // DISABLED DRAGGABLE ON MOBILE/TABLET
        // DRAGGABLE DISABLED ON MOBILE/TABLET FOR BETTER SCROLL UX
    });
    //#endregion
});