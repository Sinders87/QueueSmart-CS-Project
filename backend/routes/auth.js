const express = require("express");
const router = express.Router();
const users = require("../data/users");

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

function isValidRole(role) {
  return role === "user" || role === "admin";
}

router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Enter a valid email address" });
  }

  if (!password || String(password).length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  if (!isValidRole(role)) {
    return res.status(400).json({ success: false, message: "Role must be user or admin" });
  }

  const existingUser = users.find(
    user => user.email.toLowerCase() === String(email).trim().toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const newUser = {
    id: users.length + 1,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password: String(password),
    role
  };

  users.push(newUser);

  return res.status(201).json({
    success: true,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Enter a valid email address" });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required" });
  }

  if (!isValidRole(role)) {
    return res.status(400).json({ success: false, message: "Role must be user or admin" });
  }

  const user = users.find(
    u =>
      u.email === String(email).trim().toLowerCase() &&
      u.password === String(password) &&
      u.role === role
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;
