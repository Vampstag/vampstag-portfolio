document.addEventListener("DOMContentLoaded", () => {
    const counter = document.getElementById('counter');
    const bar = document.getElementById('bar');
    const preloader = document.getElementById('preloader');
    
    // --- 1. LOAD FOOTER SECARA TERPISAH (ASYNCHRONOUS) ---
    // Load footer segera saat halaman dibuka, tidak menunggu animasi loading selesai.
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) throw new Error("Gagal memuat footer");
                return response.text();
            })
            .then(footerData => {
                footerContainer.innerHTML = footerData;

                // FIX: Paksa elemen footer agar langsung terlihat (fade-in)
                const footerSections = footerContainer.querySelectorAll('.fade-in-section');
                footerSections.forEach(section => {
                    section.classList.add('is-visible');
                    section.style.opacity = '1'; // Paksa opacity 1 agar pasti muncul
                });

                // Re-initialize Webflow interactions
                if (window.Webflow) {
                    Webflow.destroy();
                    Webflow.ready();
                    if (Webflow.require('ix2')) {
                        Webflow.require('ix2').init();
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching footer:", error);
            });
    }

    // Jika tidak ada elemen preloader di halaman ini, hentikan script
    if (!preloader) return;

    let currentProgress = 0;

    function updateCounter() {
        // Angka lompatan (jump)
        const jump = Math.floor(Math.random() * 43) + 1;
        currentProgress += jump;
        if (currentProgress > 100) currentProgress = 100;

        if(counter) counter.innerText = currentProgress.toString().padStart(2, '0') + "%";
        if(bar) bar.style.width = currentProgress + "%";

        // Delay dasar
        let delay = Math.floor(Math.random() * 200) + 50;

        // Logika jeda buatan (Simulasi loading)
        if (currentProgress > 70 && currentProgress < 85 && Math.random() > 0.3) {
            delay = 800 + Math.random() * 1000; 
        } else if (currentProgress > 90 && currentProgress < 98) {
            delay = 400 + Math.random() * 400; 
        }

        if (currentProgress < 100) {
            setTimeout(updateCounter, delay);
        } else {
            // Selesai Loading
            const counterWrapper = document.querySelector('.counter-wrapper');
            if (counterWrapper) counterWrapper.classList.add('fade-out');

            const sfx = document.getElementById('completion-sound');
            if (sfx) {
                sfx.play().catch(e => console.log("Audio autoplay blocked:", e));
            }

            // Selesai animasi
            setTimeout(finishLoading, 500);
        }
    }

    function finishLoading() {
        if(preloader) preloader.classList.add('finished');
        document.body.style.overflow = "auto";
        if (window.lenis) window.lenis.start();
        
        // Dispatch event agar custom.js tahu preloader sudah selesai
        window.dispatchEvent(new CustomEvent('preloaderDone'));
    }

    document.body.classList.add('preloader-active');
    setTimeout(updateCounter, 500);
});