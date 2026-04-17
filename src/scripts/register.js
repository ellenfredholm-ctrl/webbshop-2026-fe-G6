const API = {
  BASE_URL: 'https://webb-projekt-2026-dun.vercel.app/events',

  async register(name, email, password) {
    const response = await fetch(`${this.BASE_URL}register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${this.BASE_URL}login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  async forgotPassword(email) {
    const response = await fetch(`${this.BASE_URL}forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send reset email');
    }

    return response.json();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");

  const loginTitle = document.getElementById("loginTitle");
  const registerTitle = document.getElementById("registerTitle");

  const showRegisterBtn = document.getElementById("showRegisterBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");

  showRegisterBtn.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";

    loginTitle.style.display = "none";
    registerTitle.style.display = "block";
  });

  showLoginBtn.addEventListener("click", () => {
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";

    registerTitle.style.display = "none";
    loginTitle.style.display = "block";
  });
});

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", () => {
      registerContainer.style.display = "none";
      loginContainer.style.display = "block";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
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

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await API.register(name, email, password);
        registerContainer.style.display = "none";
        loginContainer.style.display = "block";
      } catch (err) {
        alert(err.message);
      }
    });
  }

document.addEventListener("DOMContentLoaded", () => {
  const forgotBtn = document.getElementById("forgotPasswordBtn");
  const forgotForm = document.getElementById("forgotPasswordForm");

  if (!forgotBtn || !forgotForm) return;

  forgotBtn.addEventListener("click", () => {
    forgotForm.style.display = "block";
  });

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail")?.value;

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
});