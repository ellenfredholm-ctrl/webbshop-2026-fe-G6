document.addEventListener("DOMContentLoaded", loadEvents);

const API_EVENTS = "https://webb-projekt-2026-dun.vercel.app/events";
const API_BOOKINGS = "https://webb-projekt-2026-dun.vercel.app/events";

const TEMP_EVENTS = [
  {
    id: "1",
    title: "Summer Food Festival",
    date: "2024-07-12T14:00:00",
    location: "Kungsträdgården, Stockholm",
    totalSpots: 200,
    bookedSpots: 200,
    description:
      "Join us for an outdoor celebration of global street food, live music, and culinary workshops."
  },
  {
    id: "2",
    title: "Organic Produce Workshop",
    date: "2024-07-19T10:00:00",
    location: "Hakim Livs Store, Södermalm",
    totalSpots: 30,
    bookedSpots: 27,
    description:
      "A hands-on workshop about selecting, storing, and cooking organic vegetables."
  }
];

/* LOAD & RENDER EVENTS */


async function loadEvents() {
  const container = document.getElementById("events");
  container.innerHTML = "<p>Loading events...</p>";

  let events = [];
  let isTemp = false;

  try {
    const res = await fetch(API_EVENTS);
    if (!res.ok) throw new Error();

    events = await res.json();
  } catch {
    events = TEMP_EVENTS;
    isTemp = true;
  }

  container.innerHTML = "";

  if (isTemp) {
    const notice = document.createElement("p");
    notice.className = "temp-notice";
    notice.textContent = "Showing demo events (backend unavailable)";
    container.appendChild(notice);
  }

  events.forEach(event => {
    event.seatsLeft = event.totalSpots - event.bookedSpots;
    container.appendChild(createEventCard(event));
  });
}


/* EVENT CARD */

function createEventCard(event) {
  const card = document.createElement("div");
  card.className = "event-card";

  renderCollapsed(card, event);

  card.addEventListener("click", () => {
    const expanded = card.classList.toggle("expanded");
    expanded ? renderExpanded(card, event) : renderCollapsed(card, event);
  });

  return card;
}

/*  COLLAPSED VIEW */

function renderCollapsed(card, event) {
  card.innerHTML = `
  <div class="event-image">
  <span class="tag category">${event.category}</span>
  <span class="tag price">$${event.price}</span>
  <div class="event-pic" style="background-image: ${event.image}, linear-gradient(135deg, #7c3aed, #ec4899)"></div>
</div>
 <h3>${event.title}</h3>

<p class="meta">
  ${icon("calendar")}
  ${formatDate(event.date)}
</p>

<p class="meta">
  ${icon("location")}
  ${event.location}
</p>

<p class="meta">
  ${icon("seats")}
  Available spots: ${event.seatsLeft}
</p>
    <p>Available spots ${event.seatsLeft}</p>

    ${
      event.seatsLeft === 0
        ? `<button class="sold-out" disabled>Sold out</button>`
        : `<button class="book-btn">Book</button>`
    }
  `;
}

/*EXPANDED VIEW */

function renderExpanded(card, event) {
  if (event.seatsLeft === 0) {
    card.innerHTML = `
  <div class="event-image">
  <span class="tag category">${event.category}</span>
  <span class="tag price">$${event.price}</span>
  <div class="event-pic" style="background-image: ${event.image}, linear-gradient(135deg, #7c3aed, #ec4899)"></div>
</div>
  <div class="event-content">
     <h3>${event.title}</h3>

<p class="meta">
  ${icon("calendar")}
  ${formatDate(event.date)}
</p>

<p class="meta">
  ${icon("location")}
  ${event.location}
</p>

<p class="meta">
  ${icon("seats")}
  Available spots: ${event.seatsLeft}
</p>
      <p>${event.description}</p>
      <p class="full">This event is fully booked.</p>
      <button class="sold-out" disabled>Sold out</button>
      </div>
    `;
    return;
  }

  card.innerHTML = `
  <div class="event-image">
  <span class="tag category">${event.category}</span>
  <span class="tag price">$${event.price}</span>
    <div class="event-pic" style="background-image: ${event.image}, linear-gradient(135deg, #7c3aed, #ec4899)"></div>
</div>
    <h3>${event.title}</h3>

<p class="meta">
  ${icon("calendar")}
  ${formatDate(event.date)}
</p>

<p class="meta">
  ${icon("location")}
  ${event.location}
</p>

<p class="meta">
  ${icon("seats")}
  Available spots: ${event.seatsLeft}
</p>

    <form class="booking-form">
      <h4>Book event</h4>

      <input name="name" placeholder="Full name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="Phone number" required />

      <label class="ticket-counter">Tickets</label>
      <div class="ticket-counter">
        <button type="button" class="decrease">−</button>
        <span class="count">1</span>
        <button type="button" class="increase">+</button>
        <input type="hidden" name="seats" value="1" />
      </div>

      <button type="submit">Confirm booking</button>
    </form>
  `;

  setupTicketCounter(card, event);
  setupBooking(card, event);
  stopClickPropagation(card);
}

/* HELPERS */

function setupTicketCounter(card, event) {
  const decrease = card.querySelector(".decrease");
  const increase = card.querySelector(".increase");
  const countEl = card.querySelector(".count");
  const hiddenInput = card.querySelector('input[name="seats"]');

  let count = 1;

  increase.addEventListener("click", e => {
    e.stopPropagation();
    if (count < event.seatsLeft) {
      count++;
      countEl.textContent = count;
      hiddenInput.value = count;
    }
  });

  decrease.addEventListener("click", e => {
    e.stopPropagation();
    if (count > 1) {
      count--;
      countEl.textContent = count;
      hiddenInput.value = count;
    }
  });
}

function setupBooking(card, event) {
  const form = card.querySelector(".booking-form");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    e.stopPropagation();

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(API_BOOKINGS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ...data,
          seats: Number(data.seats)
        })
      });

      if (!res.ok) throw new Error();

      event.seatsLeft -= Number(data.seats);

      card.innerHTML = `
        <h3>${event.tiitle}</h3>
        <p class="confirmation">
          ✅ Thank you ${data.name}! Your booking is confirmed.
        </p>
      `;

    } catch {
      alert("Booking failed. Please try again.");
    }
  });
}

function stopClickPropagation(card) {
  card.querySelectorAll("button, form, input").forEach(el => {
    el.addEventListener("click", e => e.stopPropagation());
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function icon(type) {
  const icons = {
    calendar: `
      <svg viewBox="0 0 24 24">
        <path d="M7 2v2M17 2v2M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
      </svg>
    `,
    location: `
      <svg viewBox="0 0 24 24">
        <path d="M12 21s7-7.75 7-13a7 7 0 10-14 0c0 5.25 7 13 7 13z"/>
        <circle cx="12" cy="8" r="2.5"/>
      </svg>
    `,
    seats: `
      <svg viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    `
  };

  return `<span class="icon ${type}">${icons[type]}</span>`;
}