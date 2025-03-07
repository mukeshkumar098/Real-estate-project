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

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email)
    if (!email) {
      return res.status(400).send({ message: "please provide valid email" });
    }
    const checkUser = await userModel.findOne({ email });
    if (!checkUser) {
      return res
        .status(400)
        .send({ message: "user not found please register" });
    }
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    console.log("Generated reset token:", token);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD
      },
    });


    console.log(transporter);
    
    const receiver = {
      from: "",
      to: email,
      subject: "password reset request",
      text: `Click this link to reset your password: ${resetLink}`,
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}" target="_blank" 
          style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };
    await transporter.sendMail(receiver);

    return res
      .status(200)
      .send({
        message: "password reset link send successfully on your gmail account",
      });
  } catch (error) {
    res.status(400).send({ message: "something went wrong!" });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).send({ message: "Please provide a password!" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).send({ message: "User not found!" });
    }

    bcrypt.hash(password, +process.env.SALT_ROUNDS, async (err, hash) => {
      if (err) {
        return res.status(500).send({ message: "Error while resetting password!" });
      }
      await user.updateOne({ password: hash });
      res.status(200).send({ success: true, message: "User password reset successfully" });
    });
  } catch (error) {
    res.status(400).send({ message: "Something went wrong!" });
  }
};

export const getUnverifiedSellers = async (req, res) => {
  try {
    const unverifiedSellers = await userModel.find({ role: 'seller', isVerified: false });
    res.status(200).json(unverifiedSellers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unverified sellers', error: error.message });
  }
};


export const getverifiedSellers = async (req, res) => {
  try {
    const verifiedSellers = await userModel.find({ role: 'seller', isVerified: true });
    res.status(200).json(verifiedSellers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unverified sellers', error: error.message });
  }
};


export { userRigster, userLogin, forgetPassword, resetPassword };
