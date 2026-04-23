export function getTokenPayload() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function applyNavAuth() {
  const payload = getTokenPayload();
  const isLoggedIn = !!payload;
  const isAdmin = payload?.role === "admin";

  // Log in-länk
  document.querySelectorAll(".nav-login-link").forEach(el => {
    el.style.display = isLoggedIn ? "none" : "";
  });

  // Log out-knapp
  document.querySelectorAll(".nav-logout-link").forEach(el => {
    el.style.display = isLoggedIn ? "" : "none";
    el.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "register.html";
    });
  });

  // Admin-länk
  document.querySelectorAll(".nav-admin-link").forEach(el => {
    el.style.display = (isLoggedIn && isAdmin) ? "" : "none";
  });

  // My pages-länk
  document.querySelectorAll(".nav-myprofile-link").forEach(el => {
    el.style.display = (isLoggedIn && !isAdmin) ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", applyNavAuth);