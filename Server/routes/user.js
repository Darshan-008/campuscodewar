import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/user.js";
import UserCode from "../models/userCode.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();

// Public routes (no auth required)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all the required data" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    };
    res.status(200)
      .cookie("token", token, options)
      .json({
        message: "You have successfully logged in!",
        success: true,
        token,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          role: user.role,
          profile: user.profile,
          preferences: user.preferences,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      name = "Anonymous",
      bio = "This user prefers to keep an air of mystery about them.",
      programmingLanguage,
      theme,
      role,
    } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).send("Please enter all the required fields");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(
      name || userName
    )}`;

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      role: role || "user",
      profile: {
        name,
        bio,
        avatarUrl,
      },
      preferences: {
        programmingLanguage: programmingLanguage || "Python",
        theme: theme || "light",
      },
    });

    // Fix: Properly format JWT sign parameters
    const token = jwt.sign(
      {
        userId: user._id,
        userRole: user.role
      },
      process.env.SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    // Don't send password in response
    const userResponse = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist." });
    }
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\nhttp://localhost:5173/reset-password/${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected routes (auth required)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profile = profile;
    user.preferences = preferences;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/saveUserCode", authMiddleware, async (req, res) => {
  try {
    const { problemId, code, language, status } = req.body;
    const userId = req.user.id;

    let userCode = await UserCode.findOne({ userId, problemId, language });

    if (userCode) {
      userCode.code = code;
      userCode.status = status;
    } else {
      userCode = new UserCode({ userId, problemId, code, language, status });
    }

    await userCode.save();

    res.json({ message: "Code saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getUserCode", authMiddleware, async (req, res) => {
  try {
    const { problemId, language } = req.query;
    const userId = req.user.id;

    const userCode = await UserCode.findOne({ userId, problemId, language });

    if (!userCode) {
      return res.status(404).json({ message: "User code not found" });
    }

    res.json({ code: userCode.code, status: userCode.status });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
