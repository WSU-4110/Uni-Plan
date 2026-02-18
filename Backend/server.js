import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Fake users (for now)
const users = [
  { username: "habib", password: "1234" },
  { username: "jimin", password: "password1" },
  { username: "alyssa", password: "planner2026" },
  { username: "nahyun", password: "schedule!" },
  { username: "zach", password: "uni123" }
];

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    return res.json({
      success: true,
      message: "Login successful"
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
