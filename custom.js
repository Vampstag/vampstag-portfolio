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
                // initFooterMagnetic(); // DISABLED FOR PERFORMANCE
                // initExperienceTilt(); // DISABLED FOR PERFORMANCE
            } else {
                // window.addEventListener('load', initFooterMagnetic); // DISABLED FOR PERFORMANCE
            }
        };

        if (document.body.classList.contains('preloader-active')) {
            window.addEventListener('preloaderDone', startSequence, { once: true });
        } else {
            startSequence();
        }

        // --- 4. Magnetic Button Effect ---
        // DISABLED FOR PERFORMANCE: This effect adds listeners to mouse movement, which can cause scroll lag.

        // --- 6. Footer Magnetic Links ---
        // DISABLED FOR PERFORMANCE: This effect adds listeners to mouse movement, which can cause scroll lag.
        // function initFooterMagnetic() { ... }

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