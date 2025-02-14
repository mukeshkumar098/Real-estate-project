import { userModel } from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// User Registration
const userRigster = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "admin") {
      let adminExists = await userModel.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(403).json({ message: "An Admin already exists!" });
      }
    }

    bcrypt.hash(password, +process.env.SALT_ROUND, async (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Password hashing failed" });
      }

      const user = new userModel({ name, email, password: hash, role });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// User Login
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Token generation failed" });
        }

        res.json({
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    const checkUser = await userModel.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Please provide a new password" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    bcrypt.hash(password, +process.env.SALT_ROUND, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: "Password hashing failed", error: err });
      }

      await user.updateOne({ password: hash });

      res.status(200).json({ message: "Password reset successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid or expired token", error: error.message });
  }
};

export { userRigster, userLogin, forgetPassword, resetPassword };
