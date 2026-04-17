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
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const bookingsList = document.getElementById("bookingsList");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  loadBookings(token, bookingsList);
});

async function loadBookings(token, container) {
  try {
    const bookings = await API.getBookings(token);

    container.innerHTML = "";

    if (!bookings || bookings.length === 0) {
      container.innerHTML = "<li>No bookings yet</li>";
      return;
    }

    bookings.forEach(booking => {
      const li = document.createElement("li");
      li.textContent = `${booking.eventName} – ${booking.date}`;
      container.appendChild(li);
    });

  } catch (error) {
    alert(error.message);
  }
}