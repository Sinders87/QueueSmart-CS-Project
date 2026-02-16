function getSelectedRole() {
  const el = document.querySelector('input[name="role"]:checked');
  return el ? el.value : "";
}

function saveSession(email, role) {
  localStorage.setItem("qs_email", email);
  localStorage.setItem("qs_role", role);
}

function clearAllFieldErrors(formEl) {
  const inputs = formEl.querySelectorAll("input");
  inputs.forEach(clearFieldError);
}

function wireLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllFieldErrors(form);

    const email = emailEl.value;
    const password = passEl.value;
    const role = getSelectedRole();

    let ok = true;

    if (!isValidEmail(email)) {
      setFieldError(emailEl, "Enter a valid email address");
      ok = false;
    }

    if (!minLength(password, 6)) {
      setFieldError(passEl, "Password must be at least 6 characters");
      ok = false;
    }

    if (!role) {
      const roleBox = document.getElementById("roleBox");
      if (roleBox) roleBox.textContent = "Select a role to continue";
      ok = false;
    } else {
      const roleBox = document.getElementById("roleBox");
      if (roleBox) roleBox.textContent = "";
    }

    if (!ok) return;

    saveSession(email.trim(), role);

    if (role === "admin") {
      window.location.href = "../pages/admin-dashboard.html";
      return;
    }

    window.location.href = "../pages/user-dashboard.html";
  });
}

function wireRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllFieldErrors(form);

    const name = nameEl.value;
    const email = emailEl.value;
    const password = passEl.value;
    const role = getSelectedRole();

    let ok = true;

    if (isEmpty(name)) {
      setFieldError(nameEl, "Name is required");
      ok = false;
    }

    if (!isValidEmail(email)) {
      setFieldError(emailEl, "Enter a valid email address");
      ok = false;
    }

    if (!minLength(password, 6)) {
      setFieldError(passEl, "Password must be at least 6 characters");
      ok = false;
    }

    if (!role) {
      const roleBox = document.getElementById("roleBox");
      if (roleBox) roleBox.textContent = "Select a role to continue";
      ok = false;
    } else {
      const roleBox = document.getElementById("roleBox");
      if (roleBox) roleBox.textContent = "";
    }

    if (!ok) return;

    saveSession(email.trim(), role);

    if (role === "admin") {
      window.location.href = "../pages/admin-dashboard.html";
      return;
    }

    window.location.href = "../pages/user-dashboard.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireLoginForm();
  wireRegisterForm();
});
