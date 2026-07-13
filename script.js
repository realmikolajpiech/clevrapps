const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollRange > 0 ? Math.min(scrollTop / scrollRange, 1) : 0;

  if (header && !header.classList.contains("header-solid")) {
    header.classList.toggle("is-scrolled", scrollTop > 30);
  }

  if (progress) {
    progress.style.transform = `scaleX(${ratio})`;
  }
};

updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });

if (menuButton && siteNav) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5%" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const tiltArea = document.querySelector("[data-tilt]");
const logoCard = tiltArea?.querySelector(".logo-card");

if (tiltArea && logoCard && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  tiltArea.addEventListener("pointermove", (event) => {
    const bounds = tiltArea.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    logoCard.style.transform = `rotate(2.5deg) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translate3d(${x * 8}px, ${y * 8}px, 0)`;
  });

  tiltArea.addEventListener("pointerleave", () => {
    logoCard.style.transform = "rotate(2.5deg)";
  });
}

const counters = document.querySelectorAll("[data-count]");

if (counters.length && "IntersectionObserver" in window && !reducedMotion) {
  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const start = performance.now();
        const duration = 900;

        const tick = (now) => {
          const elapsed = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - elapsed, 3);
          element.textContent = Math.round(target * eased);
          if (elapsed < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.unobserve(element);
      });
    },
    { threshold: 0.7 },
  );

  counters.forEach((counter) => {
    counter.textContent = "0";
    countObserver.observe(counter);
  });
}

const parallaxItems = [...document.querySelectorAll("[data-parallax]")];

if (parallaxItems.length && !reducedMotion && window.matchMedia("(min-width: 821px)").matches) {
  let ticking = false;

  const updateParallax = () => {
    parallaxItems.forEach((item) => {
      const bounds = item.parentElement.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const offset = (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) * Number(item.dataset.parallax);
      item.style.marginBottom = `${offset}px`;
    });
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      requestAnimationFrame(updateParallax);
      ticking = true;
    },
    { passive: true },
  );
}
