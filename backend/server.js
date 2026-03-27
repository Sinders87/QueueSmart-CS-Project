const http = require("node:http");

const users = [];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

function isValidRole(role) {
  return role === "user" || role === "admin";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", err => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { success: true });
  }

  if (req.method === "GET" && req.url === "/") {
    return sendJson(res, 200, {
      success: true,
      message: "QueueSmart backend running"
    });
  }

  if (req.method === "POST" && req.url === "/api/auth/register") {
    try {
      const { name, email, password, role } = await readBody(req);

      if (!name || !String(name).trim()) {
        return sendJson(res, 400, { success: false, message: "Name is required" });
      }

      if (!isValidEmail(email)) {
        return sendJson(res, 400, { success: false, message: "Enter a valid email address" });
      }

      if (!password || String(password).length < 6) {
        return sendJson(res, 400, { success: false, message: "Password must be at least 6 characters" });
      }

      if (!isValidRole(role)) {
        return sendJson(res, 400, { success: false, message: "Role must be user or admin" });
      }

      const existingUser = users.find(
        user => user.email.toLowerCase() === String(email).trim().toLowerCase()
      );

      if (existingUser) {
        return sendJson(res, 400, { success: false, message: "Email already registered" });
      }

      const newUser = {
        id: users.length + 1,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password: String(password),
        role
      };

      users.push(newUser);

      return sendJson(res, 201, {
        success: true,
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch {
      return sendJson(res, 400, { success: false, message: "Invalid JSON body" });
    }
  }

  if (req.method === "POST" && req.url === "/api/auth/login") {
    try {
      const { email, password, role } = await readBody(req);

      if (!isValidEmail(email)) {
        return sendJson(res, 400, { success: false, message: "Enter a valid email address" });
      }

      if (!password) {
        return sendJson(res, 400, { success: false, message: "Password is required" });
      }

      if (!isValidRole(role)) {
        return sendJson(res, 400, { success: false, message: "Role must be user or admin" });
      }

      const user = users.find(
        u =>
          u.email === String(email).trim().toLowerCase() &&
          u.password === String(password) &&
          u.role === role
      );

      if (!user) {
        return sendJson(res, 401, { success: false, message: "Invalid credentials" });
      }

      return sendJson(res, 200, {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch {
      return sendJson(res, 400, { success: false, message: "Invalid JSON body" });
    }
  }

  return sendJson(res, 404, { success: false, message: "Route not found" });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});