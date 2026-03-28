function getSelectedRole() {
  const el = document.querySelector('input[name="role"]:checked');
  return el ? el.value : "";
}

function saveSession(user) {
  localStorage.setItem("qs_email", user.email);
  localStorage.setItem("qs_role", user.role);
  localStorage.setItem("qs_user", JSON.stringify(user));
}

function clearAllFieldErrors(formEl) {
  const inputs = formEl.querySelectorAll("input");
  inputs.forEach(clearFieldError);
}

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  return { res, data };
}

function wireLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllFieldErrors(form);

    const email = emailEl.value.trim();
    const password = passEl.value;
    const role = getSelectedRole();
    const roleBox = document.getElementById("roleBox");

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
      if (roleBox) roleBox.textContent = "Select a role to continue";
      ok = false;
    } else {
      if (roleBox) roleBox.textContent = "";
    }

    if (!ok) return;

    try {
      const { res, data } = await postJSON("http://localhost:3000/api/auth/login", {
        email,
        password,
        role
      });

      if (!res.ok || !data.success) {
        alert(data.message || "Login failed");
        return;
      }

      saveSession(data.data);

      if (data.data.role === "admin") {
        window.location.href = "../pages/admin-dashboard.html";
        return;
      }

      window.location.href = "../pages/user-dashboard.html";
    } catch (err) {
      alert("Could not connect to backend");
      console.error(err);
    }
  });
}

function wireRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const roleBox = document.getElementById("roleBox");
  const successEl = document.getElementById("registerSuccess");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllFieldErrors(form);

    if (roleBox) roleBox.textContent = "";
    if (successEl) {
      successEl.style.display = "none";
      successEl.textContent = "";
    }

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const password = passEl ? passEl.value : "";
    const role = getSelectedRole();

    let ok = true;

    if (!nameEl || isEmpty(name)) {
      if (nameEl) setFieldError(nameEl, "Name is required");
      ok = false;
    }

    if (!emailEl || !isValidEmail(email)) {
      if (emailEl) setFieldError(emailEl, "Enter a valid email address");
      ok = false;
    }

    if (!passEl || !minLength(password, 6)) {
      if (passEl) setFieldError(passEl, "Password must be at least 6 characters");
      ok = false;
    }

    if (!role) {
      if (roleBox) roleBox.textContent = "Select a role to continue";
      ok = false;
    }

    if (!ok) return;

    try {
      const { res, data } = await postJSON("http://localhost:3000/api/auth/register", {
        name,
        email,
        password,
        role
      });

      if (!res.ok || !data.success) {
        alert(data.message || "Registration failed");
        return;
      }

      if (successEl) {
        successEl.textContent = "Registration successful. You can log in now.";
        successEl.style.display = "block";
      }

      form.reset();
      if (roleBox) roleBox.textContent = "";
    } catch (err) {
      alert("Could not connect to backend");
      console.error(err);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireLoginForm();
  wireRegisterForm();
});
