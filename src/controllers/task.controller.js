const Task = require("../models/task.model");
const User = require("../models/user.model");

const createTask = async (req, res, next) => {
  try {
    const {
      title,
      priority,
      status,
      dueDate,
      assignedTo,
      checklist,
      userEmail,
    } = req.body;

    if (!title || !priority) {
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
      owner: userEmail,
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
    const { title, priority, status, dueDate, assignedTo, userEmail } =
      req.body;

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.owner !== userEmail && task.assignedTo !== userEmail) {
      return res.status(401).json({
        success: false,
        message:
          "Task Update Access is Restricted to The Task Owner and The User it's Assigned to.",
      });
    }

    if (title) task.title = title;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo && task.owner === userEmail) task.assignedTo = assignedTo;

    task.updatedAt = new Date();

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
    const { userEmail } = req.body;

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.owner !== userEmail) {
      return res.status(401).json({
        success: false,
        message: "Task Delete Access is Restricted to The Task Owner.",
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

const updateCheckList = async (req, res, next) => {
  try {
    const { taskId, checkListId } = req.params;
    const { title, isCompleted } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Please provide taskId.",
      });
    }

    if (!checkListId) {
      return res.status(400).json({
        success: false,
        message: "Please provide checklistId.",
      });
    }

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const checklistIndex = task.checklist.findIndex(
      (checklist) => checklist._id.toString() === checkListId
    );

    if (checklistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Checklist not found.",
      });
    }

    if (title) task.checklist[checklistIndex].title = title;
    task.checklist[checklistIndex].isCompleted = isCompleted;
    task.checklist[checklistIndex].updatedAt = new Date();

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Checklist updated successfully.",
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

const deleteCheckList = async (req, res, next) => {
  try {
    const { taskId, checkListId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Please provide taskId.",
      });
    }

    if (!checkListId) {
      return res.status(400).json({
        success: false,
        message: "Please provide checkListId.",
      });
    }

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const checklistIndex = task.checklist.findIndex(
      (checklist) => checklist._id.toString() === checkListId
    );

    if (checklistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Checklist not found.",
      });
    }

    task.checklist.splice(checklistIndex, 1);
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Checklist deleted successfully.",
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

const getTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully.",
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

const getCheckList = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Please provide taskId.",
      });
    }

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (!task.checklist || task.checklist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Checklist not found.",
      });
    }

    const checklist = task.checklist;

    return res.status(200).json({
      success: true,
      message: "Checklist retrieved successfully.",
      checklist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { userEmail } = req.body;

    const userTasks = await Task.find({
      $or: [{ owner: userEmail }, { assignedTo: userEmail }],
    });

    if (!userTasks) {
      return res.status(404).json({
        success: false,
        message: "User tasks not found.",
      });
    }

    const doneTasksCount = userTasks.filter(
      (task) => task.status === "DONE"
    ).length;

    const inProgressTasksCount = userTasks.filter(
      (task) => task.status === "IN PROGRESS"
    ).length;

    const toDoTasksCount = userTasks.filter(
      (task) => task.status === "TO DO"
    ).length;

    const backlogTasksCount = userTasks.filter(
      (task) => task.status === "BACKLOG"
    ).length;

    const lowPriorityTasks = userTasks.filter(
      (task) => task.priority === "LOW"
    ).length;

    const moderatePriorityTasks = userTasks.filter(
      (task) => task.priority === "MODERATE"
    ).length;

    const highPriorityTasks = userTasks.filter(
      (task) => task.priority === "HIGH"
    ).length;

    const dueDatedTasks = userTasks.filter(
      (task) => task.dueDate //&& task.dueDate < new Date()
    ).length;

    return res.status(200).json({
      success: true,
      message: "Analytics data retrieved successfully.",
      doneTasksCount,
      inProgressTasksCount,
      toDoTasksCount,
      backlogTasksCount,
      lowPriorityTasks,
      moderatePriorityTasks,
      highPriorityTasks,
      dueDatedTasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized Access.",
      });
    }

    const userTasks = await Task.find({
      $or: [{ owner: userEmail }, { assignedTo: userEmail }],
    });

    if (!userTasks) {
      return res.status(404).json({
        success: false,
        message: "No tasks found.",
      });
    }

    const tasksByStatus = userTasks.reduce((acc, task) => {
      const status = task.status.toLowerCase().replaceAll(" ", "");

      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully.",
      tasks: {
        backlog: tasksByStatus.backlog || [],
        todo: tasksByStatus.todo || [],
        inProgress: tasksByStatus.inprogress || [],
        done: tasksByStatus.done || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, userEmail } = req.body;

    const task = await Task.findById({ _id: taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (task.owner !== userEmail && task.assignedTo !== userEmail) {
      return res.status(401).json({
        success: false,
        message:
          "Task Status Update Access is Restricted to The Task Owner and The User it's Assigned to.",
      });
    }

    task.status = status;
    task.updatedAt = new Date();

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
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

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  createCheckList,
  updateCheckList,
  deleteCheckList,
  getTask,
  getCheckList,
  getAnalytics,
  getAllTasks,
  updateTaskStatus,
};
