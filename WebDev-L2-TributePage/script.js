


document.addEventListener("DOMContentLoaded", () => {

 // SCROLL REVEAL ANIMATIONS
   
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const revealElements = document.querySelectorAll(
        ".intro-copy, " +
        ".intro-photo, " +
        ".chapter, " +
        ".archive .section-title, " +
        ".polaroid, " +
        ".legacy-title, " +
        ".legacy-cards"
    );

    if (
        "IntersectionObserver" in window &&
        !reducedMotion.matches
    ) {

        revealElements.forEach(element => {
            element.classList.add("reveal");
        });

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "revealed"
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }

                    });

                },
                {
                    threshold: 0.08,
                    rootMargin: "0px 0px -25px 0px"
                }
            );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    }

    // INTERACTIVE PHOTO GALLERY

    const photos = [
        ...document.querySelectorAll(
            ".photo-frame img, " +
            ".polaroid img, " +
            ".timeline-photo img"
        )
    ];

    let currentPhotoIndex = 0;
    let previousFocus = null;

    // Create lightbox
    const lightbox = document.createElement("div");

    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute(
        "aria-label",
        "Historical photograph viewer"
    );

    lightbox.hidden = true;

    lightbox.innerHTML = `
        <button class="lightbox-close"
                type="button"
                aria-label="Close photograph">
            &times;
        </button>

        <button class="lightbox-prev"
                type="button"
                aria-label="Previous photograph">
            &#10094;
        </button>

        <div class="lightbox-content">
            <img class="lightbox-image"
                 alt="">

            <p class="lightbox-caption"></p>

            <span class="lightbox-counter"></span>
        </div>

        <button class="lightbox-next"
                type="button"
                aria-label="Next photograph">
            &#10095;
        </button>
    `;

    document.body.appendChild(lightbox);

    const lightboxImage =
        lightbox.querySelector(".lightbox-image");

    const lightboxCaption =
        lightbox.querySelector(".lightbox-caption");

    const lightboxCounter =
        lightbox.querySelector(".lightbox-counter");

    const closeButton =
        lightbox.querySelector(".lightbox-close");

    const previousButton =
        lightbox.querySelector(".lightbox-prev");

    const nextButton =
        lightbox.querySelector(".lightbox-next");

    function showPhoto(index) {

        if (photos.length === 0) return;

        currentPhotoIndex =
            (index + photos.length) % photos.length;

        const photo = photos[currentPhotoIndex];

        // Use full original source when possible
        const imageSource = new URL(
            photo.currentSrc || photo.src
        );

        // Wikimedia URLs may have width parameters
        if (
            imageSource.hostname ===
            "commons.wikimedia.org"
        ) {
            imageSource.searchParams.delete("width");
        }

        lightboxImage.src = imageSource.href;

        lightboxImage.alt = photo.alt;

        const figure = photo.closest("figure");

        const caption = figure?.querySelector(
            "figcaption"
        );

        lightboxCaption.textContent =
            caption?.textContent.trim() ||
            photo.alt ||
            "Albert Einstein";

        lightboxCounter.textContent =
            `${currentPhotoIndex + 1} / ${photos.length}`;
    }

    function openLightbox(index) {

        previousFocus = document.activeElement;

        showPhoto(index);

        lightbox.hidden = false;

        document.body.classList.add(
            "lightbox-open"
        );

        closeButton.focus();
    }

    function closeLightbox() {

        if (lightbox.hidden) return;

        lightbox.hidden = true;

        document.body.classList.remove(
            "lightbox-open"
        );

        lightboxImage.removeAttribute("src");

        previousFocus?.focus();
    }

    function nextPhoto() {
        showPhoto(currentPhotoIndex + 1);
    }

    function previousPhoto() {
        showPhoto(currentPhotoIndex - 1);
    }

    photos.forEach((photo, index) => {

        // Make photograph accessible by keyboard
        photo.setAttribute("tabindex", "0");

        photo.setAttribute("role", "button");

        photo.setAttribute(
            "aria-label",
            `Enlarge photo: ${photo.alt}`
        );

        photo.classList.add("clickable-photo");

        photo.addEventListener("click", () => {
            openLightbox(index);
        });

        photo.addEventListener("keydown", event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                openLightbox(index);
            }

        });

    });

    closeButton.addEventListener(
        "click",
        closeLightbox
    );

    nextButton.addEventListener(
        "click",
        nextPhoto
    );

    previousButton.addEventListener(
        "click",
        previousPhoto
    );

    lightbox.addEventListener("click", event => {

        if (event.target === lightbox) {
            closeLightbox();
        }

    });

    document.addEventListener("keydown", event => {

        if (lightbox.hidden) return;

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowRight") {
            nextPhoto();
        }

        if (event.key === "ArrowLeft") {
            previousPhoto();
        }

        // Keep keyboard focus inside the viewer
        if (event.key === "Tab") {

            const controls = [
                closeButton,
                previousButton,
                nextButton
            ];

            const index = controls.indexOf(
                document.activeElement
            );

            if (event.shiftKey && index <= 0) {
                event.preventDefault();
                nextButton.focus();
            }
            else if (
                !event.shiftKey &&
                index === controls.length - 1
            ) {
                event.preventDefault();
                closeButton.focus();
            }

        }

    });

    // ANIMATED TIMELINE

    const timelineItems = document.querySelectorAll(
        ".timeline-list li"
    );

    if ("IntersectionObserver" in window) {

        const timelineObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "timeline-active"
                            );

                        }

                    });

                },
                {
                    threshold: 0.3
                }
            );

        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });

    }
    else {

        timelineItems.forEach(item => {
            item.classList.add("timeline-active");
        });

    }

    // SMART ACTIVE NAVIGATION
 

    const navLinks = document.querySelectorAll(
        ".nav-links a[href^='#']"
    );

    const sections = [
        ...navLinks
    ].map(link => {

        const sectionId =
            link.getAttribute("href");

        return document.querySelector(sectionId);

    }).filter(Boolean);

    function updateActiveNavigation() {

        let activeSection = "";

        const scrollPosition =
            window.scrollY + 160;

        sections.forEach(section => {

            if (
                section.offsetTop <= scrollPosition
            ) {
                activeSection = section.id;
            }

        });

        navLinks.forEach(link => {

            const isActive =
                link.getAttribute("href") ===
                `#${activeSection}`;

            link.classList.toggle(
                "nav-active",
                isActive
            );

            if (isActive) {

                link.setAttribute(
                    "aria-current",
                    "location"
                );

            }
            else {

                link.removeAttribute(
                    "aria-current"
                );

            }

        });

    }

    // BACK TO TOP BUTTON


    const backToTop =
        document.createElement("button");

    backToTop.className = "back-to-top";

    backToTop.type = "button";

    backToTop.setAttribute(
        "aria-label",
        "Back to top"
    );

    backToTop.textContent = "↑";

    document.body.appendChild(backToTop);

    function updateBackToTop() {

        const showButton =
            window.scrollY > 450;

        backToTop.classList.toggle(
            "visible",
            showButton
        );

        backToTop.tabIndex =
            showButton ? 0 : -1;
    }

    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: reducedMotion.matches
                    ? "instant"
                    : "smooth"
            });

        }
    );


    // =====================================
    // OPTIMIZED SCROLL HANDLER
    // =====================================

    let scrollScheduled = false;

    function handleScroll() {

        if (scrollScheduled) return;

        scrollScheduled = true;

        requestAnimationFrame(() => {

            updateActiveNavigation();

            updateBackToTop();

            scrollScheduled = false;

        });

    }

    window.addEventListener(
        "scroll",
        handleScroll,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        updateActiveNavigation
    );

    // Initial page update
    updateActiveNavigation();
    updateBackToTop();

});
