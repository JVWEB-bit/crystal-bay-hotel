"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const navMenu = document.querySelector("#primary-navigation");
    const navButton = document.querySelector(".nav-toggle");
    const bookingForm = document.querySelector("#booking-form");
    const contactForm = document.querySelector("#contact form");

    const setMessage = (element, message, isError = false) => {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle("is-error", isError);
    };

    if (navMenu && navButton) {
        const closeMenu = () => {
            navMenu.classList.remove("active");
            navButton.setAttribute("aria-expanded", "false");
            navButton.setAttribute("aria-label", "Open navigation");
        };

        navButton.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");
            navButton.setAttribute("aria-expanded", String(isOpen));
            navButton.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
        });

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 680) closeMenu();
        });
    }

    if (header) {
        const updateHeader = () => {
            header.classList.toggle("scrolled", window.scrollY > 20);
        };
        window.addEventListener("scroll", updateHeader, { passive: true });
        updateHeader();
    }

    if (bookingForm) {
        const checkIn = bookingForm.querySelector("#checkin");
        const checkOut = bookingForm.querySelector("#checkout");
        const guests = bookingForm.querySelector("#guests");
        const message = bookingForm.querySelector("#booking-message");

        const formatDateInput = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const today = formatDateInput(new Date());
        if (checkIn && checkOut) {
            checkIn.min = today;
            checkOut.min = today;

            checkIn.addEventListener("change", () => {
                const selected = checkIn.value;
                if (!selected) {
                    checkOut.min = today;
                    return;
                }

                const [year, month, day] = selected.split("-").map(Number);
                const dayAfterCheckIn = formatDateInput(
                    new Date(year, month - 1, day + 1)
                );
                checkOut.min = dayAfterCheckIn;

                if (checkOut.value && checkOut.value < dayAfterCheckIn) {
                    checkOut.value = "";
                }
                setMessage(message, "");
            });
        }

        bookingForm.addEventListener("input", () => setMessage(message, ""));
        bookingForm.addEventListener("change", () => setMessage(message, ""));

        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!checkIn || !checkOut || !guests) return;

            if (!checkIn.value) {
                setMessage(message, "Please select a check-in date.", true);
                checkIn.focus();
                return;
            }
            if (checkIn.value < today) {
                setMessage(message, "Check-in cannot be in the past.", true);
                checkIn.focus();
                return;
            }
            if (!checkOut.value) {
                setMessage(message, "Please select a check-out date.", true);
                checkOut.focus();
                return;
            }
            if (checkOut.value <= checkIn.value) {
                setMessage(
                    message,
                    "Check-out must be later than check-in.",
                    true
                );
                checkOut.focus();
                return;
            }
            if (!["1", "2", "3", "4"].includes(guests.value)) {
                setMessage(message, "Please select the number of guests.", true);
                guests.focus();
                return;
            }

            const displayDate = (value) => {
                const [year, month, day] = value.split("-").map(Number);
                return new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium"
                }).format(new Date(year, month - 1, day));
            };
            const guestCount = Number(guests.value);
            const guestLabel = guestCount === 1 ? "guest" : "guests";

            setMessage(
                message,
                `Your dates are ready: ${displayDate(checkIn.value)} to ` +
                    `${displayDate(checkOut.value)} for ${guestCount} ${guestLabel}. ` +
                    "Availability is not checked and this is not a reservation. " +
                    "Please contact the hotel to confirm a room."
            );
        });
    }

    if (contactForm) {
        const message = contactForm.querySelector("#contact-message");
        const nameInput = contactForm.querySelector("#name");

        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!contactForm.reportValidity()) return;
            if (nameInput && !nameInput.value.trim()) {
                setMessage(message, "Please enter your name.", true);
                nameInput.focus();
                return;
            }

            const guestName = nameInput ? nameInput.value.trim() : "Guest";
            setMessage(
                message,
                `Thank you, ${guestName}. Your message is ready, but has not been sent. ` +
                    "Please contact the hotel directly until a message service is connected."
            );
        });
    }

    const animatedElements = document.querySelectorAll(
        "#rooms .room-card, #services article, #benefits li"
    );

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        animatedElements.forEach((element) => {
            element.classList.add("reveal");
            revealObserver.observe(element);
        });
    } else {
        animatedElements.forEach((element) => element.classList.add("visible"));
    }

    const copyrightYear = document.querySelector("[data-copyright-year]");
    if (copyrightYear) {
        copyrightYear.textContent = String(new Date().getFullYear());
    }
});
