const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Task = require("../models/task.model");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    const user = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 8);

    if (user) {
      user.name = name;
      user.password = hashedPassword;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        data: user,
      });
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    const userDetails = await User.findOne({ email });

    if (!userDetails || !userDetails.password) {
      return res.status(404).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      userDetails.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect credentials.",
      });
    }

    const token = jwt.sign(
      {
        userId: userDetails._id,
        userEmail: userDetails.email,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      token,
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    const { name, email, oldPassword, newPassword, userId } = req.body;

    const userDetails = await User.findById(userId);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name) userDetails.name = name;

    let emailChanged = false;
    let oldEmail = userDetails.email;
    if (email && email !== userDetails.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use.",
        });
      }
      emailChanged = true;
      userDetails.email = email;
    }

    if (oldPassword && newPassword) {
      const isOldPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      );

      if (!isOldPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Old password is incorrect.",
        });
      }

      if (oldPassword === newPassword) {
        return res.status(409).json({
          success: false,
          message: "New password must be different.",
        });
      }
      userDetails.password = await bcrypt.hash(newPassword, 8);
    }

    await userDetails.save();

    if (emailChanged) {
      await Task.updateMany({ owner: oldEmail }, { $set: { owner: email } });
    }

    return res.status(200).json({
      success: true,
      message: "User details updated successfully.",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const addUser = async (req, res, next) => {
  try {
    const { email, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized Access.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const newUser = await User.create({
      email,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getUsers = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const users = await User.find({ createdBy: userId });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getUsersById = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserDetails,
  addUser,
  getUsers,
  getUsersById,
};
