
function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function isValidEmail(email) {
  if (isEmpty(email)) return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(String(email).trim());
}

function minLength(value, min) {
  if (isEmpty(value)) return false;
  return String(value).trim().length >= min;
}

function maxLength(value, max) {
  if (isEmpty(value)) return true;
  return String(value).trim().length <= max;
}

function isValidNumber(value) {
  if (isEmpty(value)) return false;
  return !Number.isNaN(Number(value));
}

function inRange(value, min, max) {
  if (!isValidNumber(value)) return false;
  const num = Number(value);
  return num >= min && num <= max;
}

function setFieldError(inputEl, message) {
  clearFieldError(inputEl);

  const error = document.createElement("div");
  error.className = "field-error";
  error.textContent = message;

  inputEl.setAttribute("aria-invalid", "true");
  inputEl.insertAdjacentElement("afterend", error);
}

function clearFieldError(inputEl) {
  inputEl.removeAttribute("aria-invalid");

  const next = inputEl.nextElementSibling;
  if (next && next.classList.contains("field-error")) {
    next.remove();
  }
}
