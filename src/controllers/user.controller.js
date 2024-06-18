const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please, Provide all the required fields",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please, Provide all the required fields",
    });
  }

  const userDetails = await User.findOne({ email: email });

  if (!userDetails) {
    return res.status(400).json({
      success: false,
      message: "User does not exists",
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, userDetails.password);

  if (!isPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: "Incorrect User Credentials",
    });
  }

  const token = await jwt.sign(
    {
      userId: userDetails._id,
      email: userDetails.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token Generation Failed",
      data: userDetails,
    });
  }

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token,
    data: userDetails,
  });
};

const updateUserDetails = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please, Provide all the required fields",
    });
  }

  const userDetails = await User.findOne({ email: email });

  if (userDetails.email === email) {
    return res.status(400).json({
      success: false,
      message: "Please, Provide different email address",
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, userDetails.password);

  if (isPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: "Please, Provide different password",
    });
  }

  const updateUserDetails = await User.findOneAndUpdate(
    {
      email: email,
    },
    {
      email: email,
      password: 123,
      updatedAt: new Date(),
      updatedBy: req.user._id,
    }
  );

  return res.status(200).json({
    success: true,
    message: "User details updated successfully",
    data: updateUserDetails,
  });
};

module.exports = {
  registerUser,
  loginUser,
  updateUserDetails,
};
