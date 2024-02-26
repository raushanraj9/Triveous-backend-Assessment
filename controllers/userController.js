const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const colors = require("colors");
require("dotenv").config();

const { userModel } = require("../models/userModel");
const { sendSms } = require("../helpers/sendingOtpPhone");
const { sendEmail } = require("../helpers/sendingEmails");
const { generateOTP } = require("../helpers/otpHelper");

var mainOtp;

exports.createUser = async (req, res) => {
  const { name, email, password, contactNumber } = req.body;
  try {
    const userExist = await userModel.findOne({ email: email });

    if (userExist) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    mainOtp = otp;

    if (!hashedPassword) {
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Error in hashing password",
      });
    }

    const userData = new userModel({
      name,
      email,
      password: hashedPassword,
      contactNumber,
    });
    await userData.save();

    // Send OTP through email
    const emailData = {
      email: userData.email,
      subject: "Welcome to Triveous Ecommerce - Registration OTP",
      body: `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <h2>Welcome to Triveous Ecommerce!</h2>
              <p>Thank you for registering with Triveous Ecommerce. Please use the following OTP to complete your registration:</p>
              <h3>${otp}</h3>
              <p>Do not share this OTP with anyone.</p>
              <p>Happy Exploring!</p>
              <p>Best regards,</p>
              <p>The Triveous Ecommerce Team</p>
              <a href="http://54.82.202.67:8080/api/login">Now Proceed for OTP Verification</a>
            </body>
          </html>
        `,
    };
    sendEmail(emailData);

    // Send OTP through SMS
    const smsData = {
      toPhoneNumber: contactNumber,
      message: `Welcome to Triveous Ecommerce ${name}! Please use the following OTP to complete your registration: ${otp} . Do not share this OTP with anyone.`,
    };
    sendSms(smsData);

    return res.status(201).json({
      status: 201,
      success: true,
      message: "Registration successful",
      data: userData,
    });
  } catch (error) {
    console.error(colors.red("Error: ", error.message));
    res.status(500).json({ status: 500, error: "Registration failed" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password, otp } = req.body;
  const SECRET_KEY = process.env.SECRET_KEY;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: 401,
        success: false,
        error: "Invalid credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: 401,
        success: false,
        error: "Invalid credentials",
      });
    }

    // Validate OTP here (compare it with the OTP sent to the user during registration)
    // if (otp != mainOtp) {
    //   return res.status(400).json({
    //     status: 400,
    //     success: false,
    //     error: "Invalid OTP",
    //   });
    // }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.error(colors.red("Error: ", error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: "Login failed",
    });
  }
};
