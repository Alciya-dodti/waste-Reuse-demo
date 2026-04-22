const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user with provided credentials
      user = new User({
        email,
        password,
        name: email.split("@")[0],
        created_at: new Date()
      });
      await user.save();
    } else {
      // Optionally update password if changed
      if (user.password !== password) {
        user.password = password;
        await user.save();
      }
    }
    res.json({ userId: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;