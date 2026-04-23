import { renderCollapsed } from "./events.js";

const API_EVENTS = "https://webb-projekt-2026-dun.vercel.app/events";

const TEMP_EVENTS = [
  { _id: "1", title: "Summer Food Festival",     date: "2024-07-12T14:00:00", location: "Stockholm",   totalSpots: 200, bookedSpots: 150, price: 0,  category: "Food"     },
  { _id: "2", title: "Organic Produce Workshop",  date: "2024-07-19T10:00:00", location: "Södermalm",  totalSpots: 30,  bookedSpots: 10,  price: 20, category: "Workshop" },
  { _id: "3", title: "Jazz Night",                date: "2024-08-03T20:00:00", location: "Gothenburg",  totalSpots: 100, bookedSpots: 60,  price: 15, category: "Music"    },
  { _id: "4", title: "Art & Design Expo",         date: "2024-08-15T11:00:00", location: "Malmö",       totalSpots: 80,  bookedSpots: 20,  price: 10, category: "Art"      },
  { _id: "5", title: "Tech Conference 2026",      date: "2024-09-01T09:00:00", location: "Stockholm",   totalSpots: 300, bookedSpots: 200, price: 50, category: "Tech"     },
];

const SLOT_CONFIG = {
  "-2": { rotateY: -70, translateX: -480, scale: 0.62, opacity: 0.35 },
  "-1": { rotateY: -42, translateX: -250, scale: 0.82, opacity: 0.72 },
   "0": { rotateY:   0, translateX:    0, scale: 1.00, opacity: 1.00 },
   "1": { rotateY:  42, translateX:  250, scale: 0.82, opacity: 0.72 },
   "2": { rotateY:  70, translateX:  480, scale: 0.62, opacity: 0.35 },
};

let currentIndex = 0;
let featuredCards = [];
let autoTimer     = null;

document.addEventListener("DOMContentLoaded", loadFeaturedEvents);

async function loadFeaturedEvents() {
  const container = document.getElementById("featured-events");
  if (!container) return;

  let events = [];
  try {
    const res = await fetch(API_EVENTS);
    if (!res.ok) throw new Error();
    events = await res.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    events = events.filter(event => new Date(event.date) >= today);
  } catch {
    events = TEMP_EVENTS;
  }

  events.slice(0, 5).forEach(event => {
    event.seatsLeft = (event.totalSpots ?? 0) - (event.bookedSpots ?? 0);
    const card = createFeaturedCard(event);
    featuredCards.push(card);
    container.appendChild(card);
  });

  renderCoverflow();
  setupNav();
  startAutoPlay();
}

function createFeaturedCard(event) {
  const card = document.createElement("div");
  card.className = "event-card featured";
  renderCollapsed(card, event);

  card.addEventListener("click", () => {
    if (card.classList.contains("carousel-active")) {
      window.location.href = `events.html?eventId=${event._id ?? event.id}`;
    }
  });

  return card;
}

function renderCoverflow() {
  const total = featuredCards.length;

  featuredCards.forEach((card, index) => {
    let offset = index - currentIndex;
    if (offset > total / 2)  offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);

    if (absOffset > 2) {
      card.style.opacity    = "0";
      card.style.pointerEvents = "none";
      card.style.zIndex     = "0";
      card.classList.remove("carousel-active");
      return;
    }

    const cfg = SLOT_CONFIG[String(offset)];

    card.style.transform     = `translateX(${cfg.translateX}px) rotateY(${cfg.rotateY}deg) scale(${cfg.scale})`;
    card.style.opacity       = String(cfg.opacity);
    card.style.zIndex        = String(10 - absOffset);
    card.style.pointerEvents = offset === 0 ? "auto" : "auto";

    card.style.filter        = absOffset === 2 ? "blur(1.5px)" : "none";

    card.style.cursor        = offset === 0 ? "pointer" : "pointer";

    card.classList.toggle("carousel-active", offset === 0);
  });

  featuredCards.forEach((card, index) => {
    card.onclick = null;
    card.addEventListener("click", () => {
      let offset = index - currentIndex;
      const total = featuredCards.length;
      if (offset > total / 2)  offset -= total;
      if (offset < -total / 2) offset += total;

      if (offset === 0) {
        // Already center → go to events page
        const event = featuredCards[index]._eventData;
      } else {
        // Navigate carousel
        navigate(offset > 0 ? 1 : -1);
      }
    }, { once: false });
  });

  updateDots();
}

function navigate(dir) {
  currentIndex = (currentIndex + dir + featuredCards.length) % featuredCards.length;
  renderCoverflow();
  resetAutoPlay();
}

function setupNav() {
  document.getElementById("carousel-prev")?.addEventListener("click", () => navigate(-1));
  document.getElementById("carousel-next")?.addEventListener("click", () => navigate(1));

  const dotsEl = document.getElementById("carousel-dots");
  if (!dotsEl) return;
  featuredCards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className       = "carousel-dot";
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.addEventListener("click", () => { currentIndex = i; renderCoverflow(); resetAutoPlay(); });
    dotsEl.appendChild(dot);
  });
  updateDots();
}

function updateDots() {
  document.querySelectorAll(".carousel-dot").forEach((d, i) =>
    d.classList.toggle("active", i === currentIndex)
  );
}

// ─── AUTOPLAY ──────────────────────────────────────────────────────
function startAutoPlay() {
  autoTimer = setInterval(() => navigate(1), 3500);
}
function resetAutoPlay() {
  clearInterval(autoTimer);
  startAutoPlay();
}


    