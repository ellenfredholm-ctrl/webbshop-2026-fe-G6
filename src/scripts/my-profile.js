const API = {
  BASE_URL: 'https://webb-projekt-2026.vercel.app/',

  async getBookings(token) {
    const response = await fetch(`${this.BASE_URL}bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    return response.json();
  },

  async getEvent(eventId, token) {
    const response = await fetch(`${this.BASE_URL}events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null; // Returnerar null om eventet inte hittas
    }

    return response.json();
  }
};

// Avkodar JWT-token och returnerar payload-objektet
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const decoded = decodeToken(token);

  if (!decoded || !decoded.email) {
    window.location.href = "index.html";
    return;
  }

  const userEmail = decoded.email;

  const logoutBtn = document.getElementById("logoutBtn");
  const bookingsList = document.getElementById("bookingsList");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  loadBookings(token, userEmail, bookingsList);
});

async function loadBookings(token, userEmail, container) {
  try {
    const allBookings = await API.getBookings(token);

    // Filtrera bokningar baserat på inloggad användares e-post
    const myBookings = allBookings.filter(
      booking => booking.email?.toLowerCase() === userEmail.toLowerCase()
    );

    container.innerHTML = "";

    if (!myBookings || myBookings.length === 0) {
      container.innerHTML = "<li>No bookings yet</li>";
      return;
    }

    // Hämta evenemangsnamn för varje bokning parallellt
    const bookingsWithEvents = await Promise.all(
      myBookings.map(async (booking) => {
        const event = await API.getEvent(booking.event, token);
        return {
          ...booking,
          eventName: event?.title || "Unknown event", // Använder title istället för name
        };
      })
    );

    bookingsWithEvents.forEach(booking => {
      const li = document.createElement("li");
      li.textContent = `${booking.eventName} – ${booking.quantity} tickets`;
      container.appendChild(li);
    });

  } catch (error) {
    alert(error.message);
  }
}
