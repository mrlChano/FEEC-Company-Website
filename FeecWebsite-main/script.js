document.addEventListener('DOMContentLoaded', function () {

    // 1. AOS Initialization
    AOS.init({
        duration: 800,    // animation duration in ms
        easing: 'ease-in-out', // animation timing function
        once: true,       // whether animation should happen only once - while scrolling down
        mirror: false,    // whether elements should animate out while scrolling past them
        offset: 80,    // offset (in px) from the original trigger point
    });

    // 10. Leaflet Map Initialization (OpenStreetMap)
    const mapElement = document.getElementById('map');
    if (mapElement) {
        // Initialize map
        // Coordinates: 14.28411, 120.88947
        const map = L.map('map').setView([14.28411, 120.88947], 18);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Create custom glowing icon
        const glowingIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: `<div class="pin-marker"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15] // Center of the icon
        });

        // Add marker with custom icon
        const marker = L.marker([14.28411, 120.88947], { icon: glowingIcon }).addTo(map);

        // Add popup
        marker.bindPopup("<b>FACTOR-EMNAS ENTERPRISES CORP.</b><br>Block 19 Lot 5 Phase 1 Beverly Homes<br>Brgy. Hugo Perez, Trece Martires City").openPopup();
    }

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 3. Gallery Popup (FancyBox)
    if (document.querySelector("[data-fancybox='gallery']")) {
        Fancybox.bind("[data-fancybox='gallery']", {
            // Your custom options
        });
    }

    // 4. Gallery Popup for Products
    if (document.querySelector("[data-fancybox='products']")) {
        Fancybox.bind("[data-fancybox='products']", {
            // Your custom options
        });
    }

    // 5. Copyright Year
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 7. Scroll to Top
    let scrollToTopButton = document.getElementById("scrollToTopBtn");

    // Show/Hide button on scroll
    window.onscroll = function () {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            scrollToTopButton.classList.add("active");
        } else {
            scrollToTopButton.classList.remove("active");
        }
    };

    // Smooth scroll to top on click
    scrollToTopButton.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 8. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only handle if it's not just "#" (empty anchor)
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const navbarHeight = document.getElementById('navbar')?.offsetHeight || 90;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    // Close mobile menu if open
                    const navbarCollapse = document.getElementById('navbarNav');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                        if (bsCollapse) {
                            bsCollapse.hide();
                        }
                    }
                }
            }
        });
    });

    // 9. Scroll Spy - Active Navbar Link Indicator
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Map section IDs to their corresponding nav links
    // Home link is special - it has href="#" or contains "Home" text
    const homeLink = Array.from(navLinks).find(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim().toLowerCase();
        return href === '#' || (href && !href.startsWith('#')) || text === 'home';
    });

    // Section to nav link mapping
    const sectionNavMap = [
        { sectionId: 'hero', navLink: homeLink },
        { sectionId: 'about', navLink: document.querySelector('a[href="#about"]') },
        { sectionId: 'services', navLink: document.querySelector('a[href="#services"]') },
        { sectionId: 'product-brands', navLink: document.querySelector('a[href="#product-brands"]') },
        { sectionId: 'projects', navLink: document.querySelector('a[href="#projects"]') },
        { sectionId: 'contact', navLink: document.querySelector('a[href="#contact"]') }
    ].filter(item => item.navLink); // Remove any missing links

    // Function to update active nav link
    function updateActiveNavLink(activeSectionId) {
        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Find and activate the corresponding nav link
        const activeMapping = sectionNavMap.find(item => item.sectionId === activeSectionId);
        if (activeMapping && activeMapping.navLink) {
            activeMapping.navLink.classList.add('active');
        }
    }

    // Intersection Observer options
    // rootMargin accounts for navbar height and triggers when section enters viewport
    const navbarHeight = document.getElementById('navbar')?.offsetHeight || 90;
    const observerOptions = {
        root: null,
        rootMargin: `-${navbarHeight + 100}px 0px -50% 0px`,
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
    };

    // Track which sections are currently intersecting and their ratios
    const intersectingSections = new Map();

    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                intersectingSections.set(entry.target.id, {
                    ratio: entry.intersectionRatio,
                    boundingRect: entry.boundingClientRect,
                    top: entry.boundingClientRect.top
                });
            } else {
                intersectingSections.delete(entry.target.id);
            }
        });

        // Determine which section should be active
        let activeSectionId = null;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        if (intersectingSections.size > 0) {
            // Find the section that's most visible and closest to the top of viewport
            let bestSection = null;
            let bestScore = -1;

            intersectingSections.forEach((data, sectionId) => {
                // Calculate score: higher intersection ratio + closer to navbar = higher score
                // We want sections that are visible AND near the top of the viewport
                const distanceFromTop = Math.max(0, data.top - navbarHeight);
                const visibilityScore = data.ratio * 100;
                const positionScore = Math.max(0, 100 - (distanceFromTop / 5)); // Closer to top = higher score
                const score = visibilityScore + positionScore;

                if (score > bestScore) {
                    bestScore = score;
                    bestSection = sectionId;
                }
            });

            if (bestSection) {
                activeSectionId = bestSection;
            }
        }

        // If no sections are intersecting, find the section based on scroll position
        if (!activeSectionId) {
            const viewportTop = scrollY + navbarHeight + 100;
            let closestSection = null;
            let closestDistance = Infinity;

            sectionNavMap.forEach(({ sectionId }) => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    const sectionCenter = sectionTop + (section.offsetHeight / 2);

                    // Check if scroll position is within or near this section
                    if (scrollY >= sectionTop - 200 && scrollY <= sectionBottom + 200) {
                        const distance = Math.abs(viewportTop - sectionCenter);
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestSection = sectionId;
                        }
                    }
                }
            });

            if (closestSection) {
                activeSectionId = closestSection;
            }
        }

        // Only update if we found an active section
        // Do NOT default to 'hero' unless it's actually visible
        if (activeSectionId) {
            updateActiveNavLink(activeSectionId);
        }
    }, observerOptions);

    // Observe all sections
    sectionNavMap.forEach(({ sectionId }) => {
        const section = document.getElementById(sectionId);
        if (section) {
            observer.observe(section);
        }
    });

    // Set initial active link based on scroll position
    function setInitialActiveLink() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const navbarHeight = document.getElementById('navbar')?.offsetHeight || 90;
        const viewportTop = scrollPosition + navbarHeight + 100;

        let currentSection = null;
        let minDistance = Infinity;

        // Check which section is currently in view or closest to viewport
        sectionNavMap.forEach(({ sectionId }) => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionCenter = sectionTop + (section.offsetHeight / 2);

                // Check if section is in viewport
                const isInViewport = viewportTop >= sectionTop - 100 && scrollPosition < sectionBottom + 100;
                
                if (isInViewport) {
                    const distance = Math.abs(viewportTop - sectionCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        currentSection = sectionId;
                    }
                }
            }
        });

        // Only set active if we found a section, otherwise let the observer handle it
        if (currentSection) {
            updateActiveNavLink(currentSection);
        } else if (scrollPosition < 100) {
            // Only default to hero if we're at the very top
            updateActiveNavLink('hero');
        }
    }

    // Set initial active link
    setInitialActiveLink();
    
    // Also update on scroll to handle edge cases
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // The Intersection Observer handles most cases, this is just a backup
        }, 50);
    });

    // 10. Quote Form - Validation and Mailto Submission
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        const servicesError = document.getElementById('servicesError');
        const successAlert = document.getElementById('quoteSuccess');

        quoteForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (servicesError) {
                servicesError.classList.add('d-none');
            }
            if (successAlert) {
                successAlert.classList.add('d-none');
            }

            const serviceCheckboxes = quoteForm.querySelectorAll('input[name="services[]"]');
            let hasService = false;
            serviceCheckboxes.forEach(cb => {
                if (cb.checked) {
                    hasService = true;
                }
            });

            let formValid = quoteForm.checkValidity();

            if (!hasService) {
                formValid = false;
                if (servicesError) {
                    servicesError.classList.remove('d-none');
                }
            }

            if (!formValid) {
                quoteForm.reportValidity();
                return;
            }

            const emailInput = quoteForm.querySelector('#clientEmail');
            const companyInput = quoteForm.querySelector('#companyName');
            const phoneInput = quoteForm.querySelector('#phone');
            const preferredDateInput = quoteForm.querySelector('#preferredDate');
            const locationInput = quoteForm.querySelector('#projectLocation');
            const descriptionInput = quoteForm.querySelector('#projectDescription');

            const selectedServices = [];
            serviceCheckboxes.forEach(cb => {
                if (cb.checked) {
                    selectedServices.push(cb.dataset.label || cb.value);
                }
            });

            const lines = [];
            lines.push(`Company Name: ${companyInput.value}`);
            lines.push(`Client Email: ${emailInput.value}`);
            if (phoneInput && phoneInput.value.trim()) {
                lines.push(`Phone Number: ${phoneInput.value.trim()}`);
            }
            if (preferredDateInput && preferredDateInput.value) {
                lines.push(`Preferred Start Date: ${preferredDateInput.value}`);
            }
            if (locationInput && locationInput.value.trim()) {
                lines.push(`Project Location / Address: ${locationInput.value.trim()}`);
            }
            lines.push('');
            lines.push('Services Requested:');
            selectedServices.forEach(service => {
                lines.push(`- ${service}`);
            });
            if (descriptionInput && descriptionInput.value.trim()) {
                lines.push('');
                lines.push('Project Description / Additional Notes:');
                lines.push(descriptionInput.value.trim());
            }

            const subject = encodeURIComponent('Quote Request from FEEC Website');
            const body = encodeURIComponent(lines.join('\n'));
            const mailtoLink = `mailto:factoremnas.engineering@gmail.com?subject=${subject}&body=${body}`;

            if (successAlert) {
                successAlert.classList.remove('d-none');
            }

            window.location.href = mailtoLink;
        });
    }

});
