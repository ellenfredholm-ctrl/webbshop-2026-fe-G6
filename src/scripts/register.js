const API = {
  BASE_URL: "https://webb-projekt-2026-dun.vercel.app/",

  async register(name, email, password, role = "user", adminSecret = null) {
    const body = {name, email, password, role};
    if (adminSecret) body.adminSecret = adminSecret;

     console.log('sending:', body);

    const response = await fetch(`${this.BASE_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${this.BASE_URL}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  async forgotPassword(email) {
    const response = await fetch(`${this.BASE_URL}forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Failed to send reset email");
    return response.json();
  },
};


document.addEventListener("DOMContentLoaded", () => {

  const loginContainer    = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");
  const loginTitle        = document.getElementById("loginTitle");
  const registerTitle     = document.getElementById("registerTitle");

  const showRegisterBtn   = document.getElementById("showRegisterBtn");
  const showLoginBtn      = document.getElementById("showLoginBtn");

  const loginForm         = document.getElementById("loginForm");       
  const registerForm      = document.getElementById("registerForm");   

  const forgotBtn         = document.getElementById("forgotPasswordBtn");
  const forgotForm        = document.getElementById("forgotPasswordForm");

  // --- Visa registrerings-vy ---
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", () => {
      loginContainer.style.display    = "none";
      registerContainer.style.display = "block";
      if (loginTitle)    loginTitle.style.display    = "none";
      if (registerTitle) registerTitle.style.display = "block";
    });
  }

  // --- Visa login-vy ---
  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", () => {
      registerContainer.style.display = "none";
      loginContainer.style.display    = "block";
      if (registerTitle) registerTitle.style.display = "none";
      if (loginTitle)    loginTitle.style.display    = "block";
    });
  }

  // --- Login-formulär ---
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email    = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      try {
        const data = await API.login(email, password);
        localStorage.setItem("token", data.token);
        window.location.href = "my-profile.html";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // --- Registrerings-formulär ---
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const adminSecret = document.getElementById("adminSecret")?.value.trim();
      const role = adminSecret ? "admin" : "user";

      try {
        await API.register(name, email, password, role, adminSecret);
        registerContainer.style.display = "none";
        loginContainer.style.display    = "block";
        if (registerTitle) registerTitle.style.display = "none";
        if (loginTitle)    loginTitle.style.display    = "block";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // --- Glömt lösenord ---
  if (forgotBtn && forgotForm) {
    forgotBtn.addEventListener("click", () => {
      forgotForm.style.display = "block";
    });

    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("forgotEmail")?.value.trim();
      if (!email) return;

      try {
        await API.forgotPassword(email);
        forgotForm.reset();
        forgotForm.style.display = "none";
        alert("Reset email sent");
      } catch (err) {
        alert(err.message);
      }
    });
  }

});