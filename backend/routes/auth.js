const express = require("express");
const router = express.Router();
const { getUserByEmail, createUser, validateLogin } = require("../data/users");

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

function isValidRole(role) {
  return role === "user" || role === "admin";
}

router.post("/register", async (req, res) => {
  try {
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

    const cleanEmail = String(email).trim().toLowerCase();
    const existingUser = await getUserByEmail(cleanEmail);

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const newUser = await createUser({
      fullName: String(name).trim(),
      email: cleanEmail,
      password: String(password),
      role
    });

    return res.status(201).json({
      success: true,
      data: {
        id: newUser.user_id,
        name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
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

    const user = await validateLogin(
      String(email).trim().toLowerCase(),
      String(password),
      role
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
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
