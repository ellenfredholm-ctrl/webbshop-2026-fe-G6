import { getBaseUrl } from "./api.js";

export async function getEvents() {
  const url = new URL("events", getBaseUrl());
  const response = await fetch(url);
  if (response.ok) {
    return response.json();
  }
  return [];
}

export async function createEvent(event) {
  const token = localStorage.getItem('token');
  const url = new URL("events", getBaseUrl());
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(event),
  });
  if (response.ok) {
    return response.json().catch(() => ({}));
  }
  const err = await response.json().catch(() => ({}));
  throw new Error(err.errors?.[0]?.msg || "Failed to create event");
}

export async function updateEvent(id, updatedData) {
  const token = localStorage.getItem('token');
  const url = new URL(`events/${id}`, getBaseUrl());
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updatedData),
  });
  if (response.ok) {
    return response.json().catch(() => ({}));
  }
  const err = await response.json().catch(() => ({}));
  throw new Error(err.errors?.[0]?.msg || "Failed to update event");
}

export async function deleteEvent(id) {
  const token = localStorage.getItem('token');
  const url = new URL(`events/${id}`, getBaseUrl());
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (response.ok) {
    return response.json().catch(() => ({}));
  }
  const err = await response.json().catch(() => ({}));
  throw new Error(err.errors?.[0]?.msg || "Failed to delete event");
}


export async function getBookings(eventId) {
  const url = new URL(`bookings/event/${eventId}`, getBaseUrl());
  const response = await fetch(url);
  if (response.ok) {
    return response.json().catch(() => []);
  }
  return [];
}

export async function deleteBooking(bookingId) {
  const url = new URL(`bookings/${bookingId}`, getBaseUrl());
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (response.ok) {
    return true;
  }
  const err = await response.json().catch(() => ({}));
  throw new Error(err.errors?.[0]?.msg || "Failed to delete booking");
}