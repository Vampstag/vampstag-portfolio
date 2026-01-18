document.addEventListener("DOMContentLoaded", (event) => {
    // Wait for GSAP to be loaded
    const initPortfolioAnimations = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            setTimeout(initPortfolioAnimations, 100);
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);

        // 1. Hero & UI Entry Animations
        // Fade in the headline
        gsap.to('[data-w-id="b6a74ce0-53b7-4af7-a5ab-4044ee371a0f"]', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.2
        });

        // Fade in the portfolio tab menu
        gsap.to('[data-w-id="b6a74ce0-53b7-4af7-a5ab-4044ee371ba0"]', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.5
        });

        // 2. Portfolio Filter System (Dynamic & Optimized)
        const projectsData = [
            {
                id: 1,
                title: "Tsukamie Noodle Bar",
                year: "2025",
                category: "marketing",
                link: "/studi",
                description: "Digital marketing campaign driving +148K new audience reach.",
                image: "https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6933c31afde10e239b6d5532_148abd4d73a501a39005296e17b15db5_image.jpg",
                srcset: "https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6933c31afde10e239b6d5532_148abd4d73a501a39005296e17b15db5_image-p-500.jpg 500w, https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6933c31afde10e239b6d5532_148abd4d73a501a39005296e17b15db5_image-p-800.jpg 800w, https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6933c31afde10e239b6d5532_148abd4d73a501a39005296e17b15db5_image-p-1080.jpg 1080w, https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6933c31afde10e239b6d5532_148abd4d73a501a39005296e17b15db5_image.jpg 1200w"
            },
            {
                id: 2,
                title: "Wonderbliss Beauty",
                year: "2024",
                category: "marketing",
                link: "/studi",
                description: "Brand activation event coverage and social media strategy.",
                image: "https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6936d1983965821485dc8b6b_461759911_641641511720796_817640999414108895_n.jpg",
                srcset: "https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6936d1983965821485dc8b6b_461759911_641641511720796_817640999414108895_n-p-500.jpg 500w, https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6936d1983965821485dc8b6b_461759911_641641511720796_817640999414108895_n-p-800.jpg 800w, https://cdn.prod.website-files.com/6933c25a0996b0f96f5c2bc3/6936d1983965821485dc8b6b_461759911_641641511720796_817640999414108895_n.jpg 1080w"
            },
            // Placeholders for other categories
            {
                id: 3,
                title: "Creative Campaign 01",
                year: "2024",
                category: "creative",
                link: "#",
                description: "Visual storytelling project for a local fashion brand.",
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
                srcset: ""
            },
            {
                id: 4,
                title: "Web Project Alpha",
                year: "2025",
                category: "web",
                link: "#",
                description: "High-performance e-commerce website built with Webflow.",
                image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1000&auto=format&fit=crop",
                srcset: ""
            }
        ];

        // Update Tab Counts
        const categories = ['all', 'marketing', 'creative', 'web'];
        categories.forEach(cat => {
            const count = cat === 'all' ? projectsData.length : projectsData.filter(p => p.category === cat).length;
            const tabText = document.querySelector(`[data-filter="${cat}"] .text-block-7`);
            if (tabText) tabText.innerText = `${tabText.innerText} (${count})`;
        });

        const gridContainer = document.getElementById('portfolio-grid');
        const filterLinks = document.querySelectorAll('[data-filter]');
        const searchInput = document.getElementById('portfolio-search');
        const searchContainer = document.querySelector('.portfolio-search-container');
        
        let currentFilter = 'all';
        let currentSearch = '';

        function renderProjects(animate = true) {
            // Filter data
            const filteredData = projectsData.filter(item => {
                const categoryMatch = currentFilter === 'all' || item.category === currentFilter;
                const searchMatch = item.title.toLowerCase().includes(currentSearch.toLowerCase());
                return categoryMatch && searchMatch;
            });

            const updateContent = () => {
                gridContainer.innerHTML = '';
                
                if (filteredData.length === 0) {
                    gridContainer.innerHTML = '<div class="no-results">No projects found matching your criteria.</div>';
                } else {
                    filteredData.forEach(project => {
                        const itemHTML = `
                            <a href="${project.link}" class="blog-main-wrapper w-inline-block">
                                <div class="button-icon-main">
                                    <div class="buton-icon-svg w-embed">
                                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                                    </div>
                                    <div class="buton-icon-svg is-absolute w-embed">
                                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                                    </div>
                                </div>
                                <div class="image-wrap auto full-ratio">
                                    <img src="${project.image}" 
                                         srcset="${project.srcset}" 
                                         sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 940px" 
                                         alt="${project.title}" 
                                         loading="lazy" 
                                         decoding="async" 
                                         class="paralax-image main"
                                         style="width: 100%; height: auto; object-fit: cover;">
                                    <div class="portfolio-overlay">
                                        <p class="portfolio-description">${project.description}</p>
                                        <div class="portfolio-cta">View Case Study</div>
                                    </div>
                                </div>
                                <div class="margin-15px right">
                                    <div class="text-block-3">${project.title}</div>
                                    <div class="text-block-3">${project.year}</div>
                                </div>
                            </a>
                        `;
                        gridContainer.insertAdjacentHTML('beforeend', itemHTML);
                    });
                }

                // Re-init parallax for new items
                ScrollTrigger.refresh();
                initParallax();
                initCardHover(); // Initialize hover effect for new items
                initMagneticButtons(); // Initialize magnetic effect for buttons
            };

            if (animate) {
                // Premium Exit Animation
                gsap.to(gridContainer.children, { 
                    opacity: 0, 
                    y: -20, 
                    duration: 0.3, 
                    stagger: 0.05, 
                    ease: "power2.in",
                    onComplete: () => {
                        updateContent();
                        // Premium Entrance Animation
                        gsap.fromTo(gridContainer.children, 
                            { opacity: 0, y: 30 },
                            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
                        );
                    }
                });
            } else {
                updateContent();
            }
        }

        // Initialize with default category
        renderProjects(true);

        // Filter Click Logic
        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update Active State
                filterLinks.forEach(l => l.classList.remove('w--current'));
                link.classList.add('w--current');

                // Render
                currentFilter = link.getAttribute('data-filter');
                renderProjects(true);
            });
        });

        // Search Input Logic
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.trim();
                
                // Toggle Clear Button
                if (currentSearch.length > 0) {
                    searchContainer.classList.add('has-text');
                } else {
                    searchContainer.classList.remove('has-text');
                }
                
                renderProjects(false); // No fade animation for typing to keep it snappy
            });
        }

        // Clear Button Logic
        const clearBtn = document.querySelector('.clear-icon');
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent search container click (expand) logic
                searchInput.value = '';
                currentSearch = '';
                searchContainer.classList.remove('has-text');
                renderProjects(false);
                searchInput.focus();
            });
        }

        // Search Bar Expand Logic
        
        if (searchContainer && searchInput) {
            searchContainer.addEventListener('click', () => {
                searchContainer.classList.add('active');
                searchInput.focus();
            });

            searchInput.addEventListener('blur', () => {
                if (searchInput.value.trim() === '') {
                    searchContainer.classList.remove('active');
                }
            });
        }

        // 3. FAQ Accordion Logic
        const faqLinks = document.querySelectorAll('.tab-link-faq');
        faqLinks.forEach(link => {
            // Initialize closed state
            const bottom = link.querySelector('.expandable-bottom');
            if(bottom) gsap.set(bottom, { height: 0, overflow: 'hidden', opacity: 0 });
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const bottom = this.querySelector('.expandable-bottom');
                const isClosed = bottom.style.height === '0px';

                // Close others
                faqLinks.forEach(otherLink => {
                    if(otherLink !== link) {
                        const otherBottom = otherLink.querySelector('.expandable-bottom');
                        gsap.to(otherBottom, { height: 0, opacity: 0, duration: 0.3, ease: "power2.inOut" });
                    }
                });

                // Toggle current
                if(isClosed) {
                    gsap.to(bottom, { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" });
                } else {
                    gsap.to(bottom, { height: 0, opacity: 0, duration: 0.3, ease: "power2.inOut" });
                }
            });
        });

        // 4. Parallax Images (Function to be called after render)
        function initParallax() {
            // Kill existing ScrollTriggers to prevent memory leaks/conflicts
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger && (t.trigger.classList.contains('image-wrap') || t.trigger.parentElement?.classList.contains('image-wrap'))) {
                    t.kill();
                }
            });

            gsap.utils.toArray('.paralax-image').forEach(image => {
                // Set initial state (Zoomed in slightly to allow movement without showing edges)
                gsap.set(image, { scale: 1.2 });

                gsap.fromTo(image, 
                    { yPercent: -15 }, // Increased range for better visibility
                    {
                        yPercent: 15,
                        ease: "none",
                        scrollTrigger: {
                            trigger: image.parentElement,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true // Instant sync with Lenis for smoother feel
                        }
                    }
                );
            });
        }

        // 5. Premium Card Hover Effect & 3D Tilt
        function initCardHover() {
            const cards = document.querySelectorAll('.blog-main-wrapper');
            cards.forEach(card => {
                const img = card.querySelector('.paralax-image');
                const wrapper = card.querySelector('.image-wrap');
                if (!img || !wrapper) return;

                card.addEventListener('mouseenter', () => {
                    gsap.to(img, { scale: 1.3, duration: 0.8, ease: "power2.out", overwrite: "auto" });
                });
                
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
                    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1

                    gsap.to(wrapper, {
                        rotationY: xPct * 8, // Tilt range
                        rotationX: -yPct * 8,
                        transformPerspective: 1000,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });
                
                card.addEventListener('mouseleave', () => {
                    gsap.to(img, { scale: 1.2, duration: 0.8, ease: "power2.out", overwrite: "auto" });
                    gsap.to(wrapper, {
                        rotationY: 0,
                        rotationX: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });
            });
        }

        // 6. Magnetic Button Effect (Portfolio CTA)
        function initMagneticButtons() {
            const buttons = document.querySelectorAll('.portfolio-cta');
            buttons.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    gsap.to(btn, { x: x * 0.5, y: y * 0.5, duration: 0.3, ease: "power2.out" });
                });
                
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
                });
            });
        }

        // 7. Footer Marquee (Text Rotator)
        // Note: If footer is loaded via fetch, this might need to run after fetch completes.
        // Since we have a preloader that fetches footer, we can try to init this here or rely on custom.js
        const rotator = document.querySelector('.text-rotator-main');
        if(rotator) {
            gsap.to(rotator, {
                x: "-50%", 
                ease: "linear",
                duration: 20,
                repeat: -1
            });
        }
    };
    
    // Run initialization
    initPortfolioAnimations();
});
