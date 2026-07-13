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
const formContent = document.querySelector("[data-form-content]");
const formSuccess = document.querySelector("[data-form-success]");
const successTitle = document.querySelector("[data-success-title]");
let contactScrollTimer;

const setContactPanel = (open) => {
  if (!contactTrigger || !contactPanel) return;
  contactPanel.classList.toggle("is-open", open);
  contactPanel.setAttribute("aria-hidden", String(!open));
  contactPanel.inert = !open;
  contactTrigger.setAttribute("aria-expanded", String(open));
  clearTimeout(contactScrollTimer);

  if (open) {
    requestAnimationFrame(() => {
      const focusTarget = contactForm?.classList.contains("is-complete")
        ? formSuccess
        : contactPanel.querySelector("input:not([type='hidden'])");
      focusTarget?.focus({ preventScroll: true });
    });
    contactScrollTimer = setTimeout(() => {
      const headerOffset = header?.getBoundingClientRect().height || 0;
      const targetTop = window.scrollY + contactPanel.getBoundingClientRect().top - headerOffset - 48;
      window.scrollTo({ top: targetTop, behavior: reducedMotion ? "auto" : "smooth" });
    }, reducedMotion ? 0 : 120);
  }
};

const resetContactExperience = () => {
  if (!contactForm) return;
  contactForm.reset();
  contactForm.classList.remove("is-complete");
  contactForm.removeAttribute("aria-busy");
  if (formContent) {
    formContent.setAttribute("aria-hidden", "false");
    formContent.inert = false;
  }
  if (formSuccess) {
    formSuccess.setAttribute("aria-hidden", "true");
    formSuccess.inert = true;
  }
  if (formStatus) {
    formStatus.className = "form-status";
    formStatus.textContent = "";
  }
  if (contactTrigger) {
    contactTrigger.classList.remove("is-success");
    const label = contactTrigger.querySelector("span");
    const icon = contactTrigger.querySelector("i");
    if (label) label.textContent = "Send a message";
    if (icon) icon.textContent = "+";
  }
};

if (contactTrigger && contactPanel) {
  contactTrigger.addEventListener("click", () => {
    setContactPanel(!contactPanel.classList.contains("is-open"));
  });
}

document.querySelector("[data-form-reset]")?.addEventListener("click", () => {
  resetContactExperience();
  requestAnimationFrame(() => contactPanel?.querySelector("input:not([type='hidden'])")?.focus());
});

document.querySelector("[data-contact-close]")?.addEventListener("click", () => {
  setContactPanel(false);
  setTimeout(resetContactExperience, reducedMotion ? 0 : 560);
  contactTrigger?.focus({ preventScroll: true });
});

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
    const submitterName = String(new FormData(contactForm).get("name") || "").trim();

    formStatus.className = "form-status";
    formStatus.textContent = "";
    if (submit) submit.disabled = true;
    submit?.classList.add("is-loading");
    contactForm.setAttribute("aria-busy", "true");
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
      if (successTitle) {
        const firstName = submitterName.split(/\s+/)[0];
        successTitle.textContent = firstName ? `Thanks, ${firstName} — it’s in my inbox.` : "Thanks — it’s in my inbox.";
      }
      if (formContent) {
        formContent.setAttribute("aria-hidden", "true");
        formContent.inert = true;
      }
      if (formSuccess) {
        formSuccess.setAttribute("aria-hidden", "false");
        formSuccess.inert = false;
      }
      contactForm.classList.add("is-complete");
      contactForm.removeAttribute("aria-busy");
      if (contactTrigger) {
        contactTrigger.classList.add("is-success");
        const triggerLabel = contactTrigger.querySelector("span");
        const triggerIcon = contactTrigger.querySelector("i");
        if (triggerLabel) triggerLabel.textContent = "Message sent";
        if (triggerIcon) triggerIcon.textContent = "✓";
      }
      requestAnimationFrame(() => formSuccess?.focus({ preventScroll: true }));
    } catch {
      formStatus.classList.add("is-error");
      formStatus.textContent = "Something went wrong, but your message is still here. Try again or copy the email address above.";
    } finally {
      if (submit) submit.disabled = false;
      submit?.classList.remove("is-loading");
      contactForm.removeAttribute("aria-busy");
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

const projectNavigationLinks = document.querySelectorAll(".project-card a[href^='apps/']");

if (projectNavigationLinks.length) {
  const supportsCrossDocumentTransitions =
    !reducedMotion &&
    typeof CSS !== "undefined" &&
    CSS.supports("view-transition-name: project-visual") &&
    "onpageswap" in window;

  let pendingProjectCard = null;

  window.addEventListener("pageswap", (event) => {
    if (!event.viewTransition || !pendingProjectCard) return;

    pendingProjectCard.classList.add("is-transition-source");
    const clearTransitionSource = () => {
      pendingProjectCard?.classList.remove("is-transition-source");
      pendingProjectCard = null;
    };
    event.viewTransition.finished.then(clearTransitionSource, clearTransitionSource);
  });

  if (!supportsCrossDocumentTransitions && !reducedMotion) {
    const transitionCurtain = document.createElement("div");
    transitionCurtain.className = "project-transition-curtain";
    transitionCurtain.setAttribute("aria-hidden", "true");
    document.body.appendChild(transitionCurtain);
  }

  projectNavigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const projectCard = link.closest(".project-card");
      if (!projectCard) return;

      document.querySelector(".project-card.is-transition-source")?.classList.remove("is-transition-source");
      pendingProjectCard = projectCard;
      projectCard.classList.add("is-transition-source");

      if (supportsCrossDocumentTransitions || reducedMotion) return;

      event.preventDefault();
      const bounds = link.getBoundingClientRect();
      const transitionColor = getComputedStyle(projectCard).getPropertyValue("--card-bg").trim();
      const transitionX = event.clientX || bounds.left + bounds.width / 2;
      const transitionY = event.clientY || bounds.top + bounds.height / 2;

      document.documentElement.style.setProperty("--project-transition-x", `${transitionX}px`);
      document.documentElement.style.setProperty("--project-transition-y", `${transitionY}px`);
      if (transitionColor) {
        document.documentElement.style.setProperty("--project-transition-color", transitionColor);
      }
      document.documentElement.classList.add("is-project-leaving");

      window.setTimeout(() => {
        window.location.assign(link.href);
      }, 360);
    });
  });
}

const appPageNavigationLinks = document.querySelectorAll(".app-page-nav a:not([aria-current='page'])");
const prefetchedAppPages = new Set();

const prefetchAppPage = (link) => {
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin || prefetchedAppPages.has(url.href)) return;

  const hint = document.createElement("link");
  hint.rel = "prefetch";
  hint.href = url.href;
  document.head.appendChild(hint);
  prefetchedAppPages.add(url.href);
};

appPageNavigationLinks.forEach((link) => {
  link.addEventListener("pointerenter", () => prefetchAppPage(link), { once: true });
  link.addEventListener("focus", () => prefetchAppPage(link), { once: true });
  link.addEventListener("touchstart", () => prefetchAppPage(link), { once: true, passive: true });
});
