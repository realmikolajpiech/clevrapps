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

const contactTrigger = document.querySelector("[data-contact-open]");
const contactPanel = document.querySelector("#contact-form-panel");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("[data-form-status]");

if (contactTrigger && contactPanel) {
  contactTrigger.addEventListener("click", () => {
    const willOpen = contactPanel.hidden;
    contactPanel.hidden = !willOpen;
    contactTrigger.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      requestAnimationFrame(() => {
        contactPanel.querySelector("input:not([type='hidden'])")?.focus({ preventScroll: true });
        contactPanel.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
      });
    }
  });
}

document.querySelectorAll("[data-copy-email]").forEach((button) => {
  button.addEventListener("click", async () => {
    const email = button.dataset.copyEmail;
    const state = button.querySelector("[data-copy-state]");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const helper = document.createElement("textarea");
        helper.value = email;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }

      button.classList.add("is-copied");
      if (state) state.textContent = "Copied";
      setTimeout(() => {
        button.classList.remove("is-copied");
        if (state) state.textContent = "";
      }, 2200);
    } catch {
      if (state) state.textContent = "Copy failed";
    }
  });
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = contactForm.querySelector("button[type='submit']");
    const submitLabel = submit?.querySelector("span");
    const originalLabel = submitLabel?.textContent || "Send message";

    formStatus.className = "form-status";
    formStatus.textContent = "";
    if (submit) submit.disabled = true;
    if (submitLabel) submitLabel.textContent = "Sending…";

    try {
      const payload = Object.fromEntries(new FormData(contactForm).entries());
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Submission failed");

      contactForm.reset();
      formStatus.classList.add("is-success");
      formStatus.textContent = "Message sent. Mikołaj will get back to you shortly.";
    } catch {
      formStatus.classList.add("is-error");
      formStatus.textContent = "The message could not be sent. Please copy the email address above and write directly.";
    } finally {
      if (submit) submit.disabled = false;
      if (submitLabel) submitLabel.textContent = originalLabel;
    }
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
