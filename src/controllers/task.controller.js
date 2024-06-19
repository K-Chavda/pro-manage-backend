const Task = require("../models/task.model");

const createTask = async (req, res, next) => {
  try {
    const { title, priority, owner, status, dueDate, assignedTo, checklist } =
      req.body;

    if (!title || !priority || !owner) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    const task = await Task.findOne({ title });

    if (task) {
      return res.status(409).json({
        success: false,
        message: "Task already exists.",
      });
    }

    const newTask = await Task.create({
      title,
      priority,
      owner,
      status,
      dueDate,
      assignedTo,
      checklist,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      newTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (req.body.title) task.title = req.body.title;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.owner) task.owner = req.body.owner;
    if (req.body.status) task.status = req.body.status;
    if (req.body.dueDate) task.dueDate = req.body.dueDate;
    if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;

    task.updatedAt = new Date();
    // task.updatedBy = ._id;

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await task.deleteOne({ _id: taskId });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const createCheckList = async (req, res, next) => {
  try {
    const { title, isCompleted } = req.body;
    const { taskId } = req.params;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const newCheckList = {
      title,
      isCompleted: isCompleted || false,
      createdAt: new Date(),
    };

    task.checklist.push(newCheckList);
    await task.save();

    return res.status(201).json({
      success: true,
      message: "Checklist created successfully.",
      data: newCheckList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const updateCheckList = async (req, res, next) => {};

const deleteCheckList = async (req, res, next) => {};

const getTask = async (req, res, next) => {};

const getCheckList = async (req, res, next) => {};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  createCheckList,
  updateCheckList,
  deleteCheckList,
  getTask,
  getCheckList,
};
