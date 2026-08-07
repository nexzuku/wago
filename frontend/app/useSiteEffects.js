"use client";

import { useEffect } from "react";

/**
 * Ports the original vanilla script.js behavior (counters, testimonial
 * carousel, hero tilt, live status feed, mobile sliders, navbar scroll,
 * mobile nav toggle, staggered reveal animations) into a single React
 * effect that runs once after the page mounts.
 */
export default function useSiteEffects() {
  useEffect(() => {
    const cleanupFns = [];

    // ---------- Animated stat counters ----------
    (() => {
      const statNumbers = document.querySelectorAll("[data-count-to]");
      if (!statNumbers.length) return;

      function animateCount(el) {
        const target = parseInt(el.getAttribute("data-count-to"), 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const duration = 1600;
        const startTime = performance.now();

        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        }
        requestAnimationFrame(tick);
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      statNumbers.forEach((el) => observer.observe(el));
      cleanupFns.push(() => observer.disconnect());
    })();

    // ---------- Testimonials carousel ----------
    (() => {
      const track = document.getElementById("testimonials-track");
      const dotsContainer = document.getElementById("testimonials-dots");
      if (!track || !dotsContainer) return;

      const viewport = track.closest(".testimonials-viewport");
      const cards = track.querySelectorAll(".testimonial-card");
      const totalCards = cards.length;

      let cardsPerView = window.innerWidth <= 1000 ? 1 : 3;
      let totalSlides = Math.max(totalCards - cardsPerView + 1, 1);
      let currentIndex = 0;
      let autoSlideTimer = null;
      let kickstartTimer = null;
      let touchStartX = 0;

      function buildDots() {
        dotsContainer.innerHTML = "";
        for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement("span");
          dot.classList.add("dot");
          if (i === currentIndex) dot.classList.add("active");
          dot.addEventListener("click", () => goToSlide(i));
          dotsContainer.appendChild(dot);
        }
      }

      function updateTrack() {
        const cardWidth = cards[0].getBoundingClientRect().width;
        const gap = 24;
        const offset = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;

        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
      }

      function goToSlide(index) {
        currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
        updateTrack();
        resetAutoSlide();
      }

      function nextSlide() {
        goToSlide(currentIndex + 1);
      }
      function prevSlide() {
        goToSlide(currentIndex - 1);
      }

      function startAutoSlide() {
        stopAutoSlide();
        autoSlideTimer = setInterval(() => {
          currentIndex = (currentIndex + 1) % totalSlides;
          updateTrack();
        }, 3000);
      }

      function kickstartAutoSlide() {
        kickstartTimer = setTimeout(() => {
          currentIndex = (currentIndex + 1) % totalSlides;
          updateTrack();
          startAutoSlide();
        }, 800);
      }

      function stopAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
      }

      function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
      }

      function recalc() {
        cardsPerView = window.innerWidth <= 1000 ? 1 : 3;
        totalSlides = Math.max(totalCards - cardsPerView + 1, 1);
        if (currentIndex > totalSlides - 1) currentIndex = totalSlides - 1;
        buildDots();
        updateTrack();
      }

      const onMouseEnter = () => stopAutoSlide();
      const onMouseLeave = () => startAutoSlide();
      const onTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoSlide();
      };
      const onTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) nextSlide();
          else prevSlide();
        } else {
          startAutoSlide();
        }
      };
      const onKeyDown = (e) => {
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
      };

      viewport.addEventListener("mouseenter", onMouseEnter);
      viewport.addEventListener("mouseleave", onMouseLeave);
      viewport.addEventListener("touchstart", onTouchStart, { passive: true });
      viewport.addEventListener("touchend", onTouchEnd);
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", recalc);

      buildDots();
      updateTrack();
      kickstartAutoSlide();

      cleanupFns.push(() => {
        stopAutoSlide();
        if (kickstartTimer) clearTimeout(kickstartTimer);
        viewport.removeEventListener("mouseenter", onMouseEnter);
        viewport.removeEventListener("mouseleave", onMouseLeave);
        viewport.removeEventListener("touchstart", onTouchStart);
        viewport.removeEventListener("touchend", onTouchEnd);
        document.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", recalc);
      });
    })();

    // ---------- Hero tilt effect ----------
    (() => {
      const tiltWrapper = document.getElementById("demo-tilt");
      const heroSection = document.querySelector(".wago-hero");
      if (!tiltWrapper || !heroSection) return;

      const maxTilt = 8;

      const onMouseMove = (e) => {
        const rect = heroSection.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;

        const rotateY = (relX - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - relY) * maxTilt;

        tiltWrapper.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      };

      const onMouseLeave = () => {
        tiltWrapper.style.transform = "rotateY(0deg) rotateX(0deg)";
      };

      heroSection.addEventListener("mousemove", onMouseMove);
      heroSection.addEventListener("mouseleave", onMouseLeave);

      cleanupFns.push(() => {
        heroSection.removeEventListener("mousemove", onMouseMove);
        heroSection.removeEventListener("mouseleave", onMouseLeave);
      });
    })();

    // ---------- Live status feed rotator ----------
    (() => {
      const feed = document.getElementById("live-status-feed");
      if (!feed) return;

      const items = feed.querySelectorAll(".live-status-item");
      let current = 0;

      const timer = setInterval(() => {
        items[current].classList.remove("active");
        current = (current + 1) % items.length;
        items[current].classList.add("active");
      }, 3200);

      cleanupFns.push(() => clearInterval(timer));
    })();

    // ---------- Mobile capabilities slider auto-play ----------
    (() => {
      const capGrid = document.querySelector(".capabilities-grid");
      if (!capGrid) return;

      let isMobile = window.innerWidth <= 640;
      let autoScrollInterval;
      let startTimeout;

      function scrollStep() {
        const cardElement = capGrid.querySelector(".capability-card");
        if (!cardElement) return;

        const cardWidth = cardElement.offsetWidth + 16;

        if (capGrid.scrollLeft + capGrid.clientWidth >= capGrid.scrollWidth - 10) {
          capGrid.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          capGrid.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }

      function startAutoScroll() {
        if (!isMobile) return;
        startTimeout = setTimeout(scrollStep, 1200);
        autoScrollInterval = setInterval(scrollStep, 4000);
      }

      function stopAutoScroll() {
        clearInterval(autoScrollInterval);
        clearTimeout(startTimeout);
      }

      const onResize = () => {
        isMobile = window.innerWidth <= 640;
        stopAutoScroll();
        if (isMobile) {
          startAutoScroll();
        } else {
          capGrid.scrollTo({ left: 0 });
        }
      };

      const onTouchStart = () => stopAutoScroll();
      let resumeTimeout;
      const onTouchEnd = () => {
        resumeTimeout = setTimeout(startAutoScroll, 3000);
      };

      window.addEventListener("resize", onResize);
      capGrid.addEventListener("touchstart", onTouchStart, { passive: true });
      capGrid.addEventListener("touchend", onTouchEnd);

      startAutoScroll();

      cleanupFns.push(() => {
        stopAutoScroll();
        clearTimeout(resumeTimeout);
        window.removeEventListener("resize", onResize);
        capGrid.removeEventListener("touchstart", onTouchStart);
        capGrid.removeEventListener("touchend", onTouchEnd);
      });
    })();

    // ---------- Mobile results slider ----------
    (() => {
      const slider = document.querySelector(".mobile-results-slider");
      const track = document.querySelector(".mobile-results-track");
      const slides = document.querySelectorAll(".mobile-results-track .mobile-slide");
      if (!slider || !track || !slides.length) return;

      let isMobile = window.innerWidth <= 1100;
      let currentIndex = 0;
      let autoTimer;
      let startTimer;
      let resumeTimer;

      function render() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        slides.forEach((s, i) => s.classList.toggle("in-view", i === currentIndex));
      }

      function goTo(index) {
        currentIndex = ((index % slides.length) + slides.length) % slides.length;
        render();
      }

      function startAuto() {
        if (!isMobile) return;
        stopAuto();
        startTimer = setTimeout(() => goTo(currentIndex + 1), 1200);
        autoTimer = setInterval(() => goTo(currentIndex + 1), 3500);
      }

      function stopAuto() {
        clearInterval(autoTimer);
        clearTimeout(startTimer);
      }

      let touchStartX = 0;
      const onTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
        stopAuto();
      };
      const onTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) goTo(currentIndex + 1);
          else goTo(currentIndex - 1);
        }
        resumeTimer = setTimeout(startAuto, 3000);
      };
      const onResize = () => {
        isMobile = window.innerWidth <= 1100;
        stopAuto();
        if (isMobile) startAuto();
      };

      slider.addEventListener("touchstart", onTouchStart, { passive: true });
      slider.addEventListener("touchend", onTouchEnd);
      window.addEventListener("resize", onResize);

      render();
      startAuto();

      cleanupFns.push(() => {
        stopAuto();
        clearTimeout(resumeTimer);
        slider.removeEventListener("touchstart", onTouchStart);
        slider.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("resize", onResize);
      });
    })();

    // ---------- Mobile hamburger nav toggle ----------
    (() => {
      const hamburger = document.getElementById("navHamburger");
      const navLinks = document.querySelector(".nav-links");
      if (!hamburger || !navLinks) return;

      const onHamburgerClick = () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("open");
      };

      const onDocumentClick = (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
          hamburger.classList.remove("active");
          navLinks.classList.remove("open");
        }
      };

      hamburger.addEventListener("click", onHamburgerClick);
      document.addEventListener("click", onDocumentClick);

      cleanupFns.push(() => {
        hamburger.removeEventListener("click", onHamburgerClick);
        document.removeEventListener("click", onDocumentClick);
      });
    })();

    // ---------- Staggered entrance for stat cards & detail list ----------
    (() => {
      const revealTargets = document.querySelectorAll(".result-stat-card, .detail-item, .insight-card");
      if (!revealTargets.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      revealTargets.forEach((el) => observer.observe(el));
      cleanupFns.push(() => observer.disconnect());
    })();

    // ---------- Transparent to solid navbar on scroll ----------
    (() => {
      const navbar = document.querySelector(".wago-navbar");
      if (!navbar) return;

      const onScroll = () => {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      };

      window.addEventListener("scroll", onScroll);
      cleanupFns.push(() => window.removeEventListener("scroll", onScroll));
    })();

    // ---------- Master cleanup ----------
    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);
}
