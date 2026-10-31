(function () {
  "use strict";

  function getConfig(path) {
    return path.split(".").reduce((obj, key) => (obj == null ? undefined : obj[key]), SITE_CONFIG);
  }

  function bindConfig() {
    document.querySelectorAll("[data-text]").forEach((el) => {
      const value = getConfig(el.dataset.text);
      if (value !== undefined && value !== "") el.textContent = value;
    });
    document.querySelectorAll("[data-href]").forEach((el) => {
      const value = getConfig(el.dataset.href);
      if (value) el.href = value;
    });
    document.querySelectorAll("[data-src]").forEach((el) => {
      const value = getConfig(el.dataset.src);
      if (value) el.src = value;
    });
  }

  function bindSocialLinks() {
    document.querySelectorAll("[data-social]").forEach((link) => {
      const url = SITE_CONFIG.social[link.dataset.social];
      const item = link.closest("li") || link;
      if (url) {
        link.href = url;
        item.hidden = false;
      } else {
        item.hidden = true;
      }
    });
  }

  function formatTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  }

  function renderHours() {
    const tbody = document.getElementById("hours-body");
    if (!tbody) return;
    tbody.innerHTML = SITE_CONFIG.hours
      .map(({ day, open, close }) => {
        const time = open && close ? `${formatTime(open)} – ${formatTime(close)}` : "Closed";
        return `<tr data-day="${day}"><th scope="row">${day}</th><td>${time}</td></tr>`;
      })
      .join("");
  }

  // navbar
  function initHeaderScroll() {
    const header = document.getElementById("site-header");
    if (!header) return;
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initMobileNav() {
    const header = document.getElementById("site-header");
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");
    const backdrop = document.getElementById("nav-backdrop");
    if (!header || !toggle || !menu) return;

    const desktop = window.matchMedia("(min-width: 960px)");

    const setOpen = (open) => {
      header.classList.toggle("nav-open", open);
      document.body.classList.toggle("nav-locked", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) menu.querySelector("a")?.focus({ preventScroll: true });
    };
    const isOpen = () => header.classList.contains("nav-open");

    toggle.addEventListener("click", () => setOpen(!isOpen()));
    backdrop?.addEventListener("click", () => setOpen(false));
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") {
        setOpen(false);
        toggle.focus();
      }
      // keep tab focus inside the open menu
      if (e.key === "Tab") {
        const items = [toggle, ...menu.querySelectorAll("a")];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    desktop.addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  // highlight the nav link for the section on screen
  function initActiveNav() {
    const links = [...document.querySelectorAll(".nav__link")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (!sections.length) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.35;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = sections[0];

      if (atBottom) {
        current = sections[sections.length - 1];
      } else {
        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= line) current = section;
        });
      }

      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${current.id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
  }

  // menu
  const CATEGORY_ICON = { sides: "icon-fries", drinks: "icon-cup" };

  const escapeHtml = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const formatPrice = (price) => price.toFixed(2);

  const photoFor = (item) => item.image || `images/menu/${item.id}.jpg`;

  function artFor(item) {
    const name = item.name.toLowerCase();
    if (item.category === "kids") return name.includes("popcorn") ? "popcorn" : "kids";
    if (/family|big|8 pcs/.test(name)) return "bucket";
    if (name.includes("wrap") && !name.includes("burger")) return "wrap";
    if (item.category === "combos") return "combo";
    if (name.includes("burger")) return "burger";
    if (name.includes("popcorn")) return "popcorn";
    return "chicken";
  }

  function cardHtml(item) {
    const parts = item.includes ? item.includes.split(/\s*\+\s*/) : [];
    const details = parts.length
      ? `<ul class="menu-card__includes" aria-label="Includes">${parts
          .map((p) => `<li>${escapeHtml(p)}</li>`)
          .join("")}</ul>`
      : `<p class="menu-card__desc">${escapeHtml(item.description || "")}</p>`;

    return `
      <article class="menu-card" data-category="${item.category}">
        <div class="menu-card__media menu-card__media--${item.category}">
          <svg class="menu-card__art" aria-hidden="true"><use href="#art-${artFor(item)}"></use></svg>
          <img class="menu-card__img" src="${escapeHtml(photoFor(item))}" alt="${escapeHtml(item.name)}" loading="lazy" width="480" height="360" />
          ${item.group ? `<span class="menu-card__group">${escapeHtml(item.group)}</span>` : ""}
          ${item.bestSeller ? `<span class="menu-card__badge"><svg class="icon" aria-hidden="true"><use href="#icon-star"></use></svg>Best Seller</span>` : ""}
        </div>
        <div class="menu-card__body">
          <h4 class="menu-card__name">${escapeHtml(item.name)}</h4>
          ${details}
          <p class="menu-card__price"><span>RM</span>${formatPrice(item.price)}</p>
        </div>
      </article>`;
  }

  function listHtml(category, items) {
    const icon = CATEGORY_ICON[category.id] || "icon-star";
    return `
      <div class="price-list">
        <h3 class="price-list__title">
          <svg class="icon" aria-hidden="true"><use href="#${icon}"></use></svg>${escapeHtml(category.label)}
        </h3>
        <ul class="price-list__items">
          ${items
            .map(
              (i) => `<li class="price-list__item">
                <span class="price-list__thumb"><img src="${escapeHtml(photoFor(i))}" alt="" loading="lazy" width="200" height="200" /></span>
                <span class="price-list__name">${escapeHtml(i.name)}</span>
                <span class="price-list__dots" aria-hidden="true"></span>
                <span class="price-list__price">RM ${formatPrice(i.price)}</span>
              </li>`
            )
            .join("")}
        </ul>
      </div>`;
  }

  function renderMenu() {
    const filtersEl = document.getElementById("menu-filters");
    const groupsEl = document.getElementById("menu-groups");
    if (!filtersEl || !groupsEl || typeof MENU_ITEMS === "undefined") return;

    const items = MENU_ITEMS.filter((i) => i.available !== false);
    const categories = MENU_CATEGORIES.filter((c) => c.id !== "all");
    const countOf = (id) => (id === "all" ? items.length : items.filter((i) => i.category === id).length);

    filtersEl.innerHTML = MENU_CATEGORIES.filter((c) => countOf(c.id) > 0)
      .map(
        (c, idx) => `<button class="menu-filter${idx === 0 ? " is-active" : ""}" type="button"
            data-filter="${c.id}" aria-pressed="${idx === 0}">
            ${escapeHtml(c.label)} <span class="menu-filter__count">${countOf(c.id)}</span>
          </button>`
      )
      .join("");

    const cardCategories = categories.filter((c) => c.layout !== "list");
    const listCategories = categories.filter((c) => c.layout === "list");
    const bestSellers = items.filter((i) => i.bestSeller);

    let html = "";
    if (bestSellers.length) {
      html += `
        <section class="menu-group menu-group--featured" data-group="all" aria-labelledby="group-best">
          <h3 class="menu-group__title" id="group-best">
            <svg class="icon" aria-hidden="true"><use href="#icon-star"></use></svg>Best Sellers
          </h3>
          <div class="menu-grid">${bestSellers.map(cardHtml).join("")}</div>
        </section>`;
    }
    cardCategories.forEach((c) => {
      const list = items.filter((i) => i.category === c.id);
      if (!list.length) return;
      html += `
        <section class="menu-group" data-group="${c.id}" aria-labelledby="group-${c.id}">
          <h3 class="menu-group__title" id="group-${c.id}">${escapeHtml(c.label)}</h3>
          <div class="menu-grid">${list.map(cardHtml).join("")}</div>
        </section>`;
    });
    const lists = listCategories
      .map((c) => ({ c, list: items.filter((i) => i.category === c.id) }))
      .filter(({ list }) => list.length);
    if (lists.length) {
      html += `<div class="menu-lists">${lists
        .map(({ c, list }) => `<section class="menu-group menu-group--list" data-group="${c.id}">${listHtml(c, list)}</section>`)
        .join("")}</div>`;
    }
    groupsEl.innerHTML = html;

    groupsEl.querySelectorAll(".menu-card__img").forEach((img) => {
      const markLoaded = () => img.closest(".menu-card__media").classList.add("has-photo");
      if (img.complete && img.naturalWidth) markLoaded();
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", () => img.remove());
    });
    groupsEl.querySelectorAll(".price-list__thumb img").forEach((img) => {
      img.addEventListener("error", () => img.parentElement.remove());
    });

    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      applyFilter(btn.dataset.filter);
    });

    function applyFilter(filter) {
      filtersEl.querySelectorAll("[data-filter]").forEach((b) => {
        const active = b.dataset.filter === filter;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
        if (active) b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      });
      groupsEl.dataset.filter = filter;
      groupsEl.querySelectorAll(".menu-group").forEach((g) => {
        const show = filter === "all" ? true : g.dataset.group === filter;
        g.hidden = !show;
        if (show) {
          g.classList.remove("is-entering");
          void g.offsetWidth;
          g.classList.add("is-entering");
        }
      });
      const top = groupsEl.getBoundingClientRect().top;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 72;
      if (top < header + 60) {
        window.scrollTo({ top: window.scrollY + top - header - filtersEl.offsetHeight - 24, behavior: "smooth" });
      }
    }
  }

  function initMenuBoard() {
    const link = document.getElementById("full-menu-link");
    const dialog = document.getElementById("menu-board");
    if (!link || !dialog || typeof dialog.showModal !== "function") return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      dialog.showModal();
      document.body.classList.add("nav-locked");
    });
    dialog.addEventListener("close", () => document.body.classList.remove("nav-locked"));
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.closest("[data-close-dialog]")) dialog.close();
    });
  }

  // about photo (falls back to the logo panel)
  function initPhotoSlots() {
    document.querySelectorAll(".photo-slot").forEach((slot) => {
      const img = slot.querySelector(".photo-slot__img");
      if (!img) return;
      const show = () => slot.classList.add("has-photo");
      if (img.complete && img.naturalWidth) show();
      img.addEventListener("load", show);
      img.addEventListener("error", () => img.remove());
    });
  }

  // gallery - stays hidden until there are photos
  function initGallery() {
    const section = document.getElementById("gallery");
    const grid = document.getElementById("gallery-grid");
    const dialog = document.getElementById("lightbox");
    if (!section || !grid) return;

    section.hidden = true;
    const items = [...grid.querySelectorAll(".gallery__item")];

    const checks = items.map(
      (li) =>
        new Promise((resolve) => {
          const src = li.querySelector("img").getAttribute("src");
          const probe = new Image();
          probe.onload = () => resolve(true);
          probe.onerror = () => {
            li.remove();
            resolve(false);
          };
          probe.src = src;
        })
    );

    Promise.all(checks).then((results) => {
      if (!results.some(Boolean)) return;
      section.hidden = false;
      setupLightbox();
    });

    function setupLightbox() {
      if (!dialog || typeof dialog.showModal !== "function") return;
      const imgEl = document.getElementById("lightbox-img");
      const captionEl = document.getElementById("lightbox-caption");
      const photos = () => [...grid.querySelectorAll(".gallery__item img")];
      let index = 0;

      const show = (i) => {
        const list = photos();
        index = (i + list.length) % list.length;
        const photo = list[index];
        imgEl.src = photo.currentSrc || photo.src;
        imgEl.alt = photo.alt;
        captionEl.textContent = `${photo.alt}  ·  ${index + 1} / ${list.length}`;
        dialog.classList.toggle("is-single", list.length < 2);
      };

      grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".gallery__btn");
        if (!btn) return;
        show(photos().indexOf(btn.querySelector("img")));
        dialog.showModal();
        document.body.classList.add("nav-locked");
      });

      dialog.addEventListener("close", () => document.body.classList.remove("nav-locked"));
      dialog.addEventListener("click", (e) => {
        const action = e.target.closest("[data-lightbox]")?.dataset.lightbox;
        if (action === "close" || e.target === dialog) dialog.close();
        else if (action === "prev") show(index - 1);
        else if (action === "next") show(index + 1);
      });
      dialog.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
      });

      // swipe on mobile
      let startX = null;
      dialog.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
      dialog.addEventListener("touchend", (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
        startX = null;
      });
    }
  }

  // opening hours
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  function nowInShopTimezone() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: SITE_CONFIG.timezone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    return { day: get("weekday"), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
  }

  function updateOpenStatus() {
    const statusEl = document.getElementById("open-status");
    const hours = SITE_CONFIG.hours;
    if (!statusEl || !hours?.length) return;

    const { day, minutes } = nowInShopTimezone();
    const todayIdx = hours.findIndex((h) => h.day === day);
    if (todayIdx === -1) return;
    const today = hours[todayIdx];
    const yesterday = hours[(todayIdx + hours.length - 1) % hours.length];

    document.querySelectorAll("#hours-body tr").forEach((tr) => {
      tr.classList.toggle("is-today", tr.dataset.day === day);
    });

    let open = false;
    let closesAt = null;
    if (today.open && today.close) {
      const o = toMinutes(today.open);
      const c = toMinutes(today.close);
      if (c > o ? minutes >= o && minutes < c : minutes >= o) {
        open = true;
        closesAt = today.close;
      }
    }
    // in case the shop closes after midnight
    if (!open && yesterday.open && yesterday.close) {
      const yc = toMinutes(yesterday.close);
      if (yc < toMinutes(yesterday.open) && minutes < yc) {
        open = true;
        closesAt = yesterday.close;
      }
    }

    let text;
    if (open) {
      text = `Open now · Closes ${formatTime(closesAt)}`;
    } else if (today.open && minutes < toMinutes(today.open)) {
      text = `Closed · Opens ${formatTime(today.open)}`;
    } else {
      let label = "";
      for (let i = 1; i <= 7; i++) {
        const next = hours[(todayIdx + i) % hours.length];
        if (next.open) {
          label = `${i === 1 ? "tomorrow" : next.day.slice(0, 3)} ${formatTime(next.open)}`;
          break;
        }
      }
      text = label ? `Closed · Opens ${label}` : "Closed";
    }

    statusEl.textContent = text;
    statusEl.classList.toggle("is-open", open);
    statusEl.hidden = false;
  }

  function initOpenStatus() {
    updateOpenStatus();
    setInterval(updateOpenStatus, 60 * 1000);
  }

  // fade sections in as they scroll into view
  function initReveal() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll(
      [
        ".section__header",
        ".menu-group",
        ".menu__footer",
        ".about__media",
        ".about__content",
        ".feature",
        ".gallery__item",
        ".info-block",
        ".location__map",
        ".contact__inner",
        ".footer__inner > *",
      ].join(",")
    );

    // small stagger for items that sit next to each other
    targets.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.matches(".feature, .gallery__item, .info-block, .footer__inner > *"));
      const index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 80}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-visible");
          observer.unobserve(el);
          // clean up so hover transitions aren't affected afterwards
          setTimeout(() => {
            el.classList.remove("reveal", "is-visible");
            el.style.removeProperty("--reveal-delay");
          }, 1200);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    document.documentElement.classList.add("has-reveal");
    targets.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindConfig();
    bindSocialLinks();
    renderHours();
    initHeaderScroll();
    initMobileNav();
    renderMenu();
    initMenuBoard();
    initPhotoSlots();
    initGallery();
    initOpenStatus();
    initActiveNav();
    initReveal();
  });
})();