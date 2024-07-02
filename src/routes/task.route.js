const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const verifyToken = require("../middlewares/verifyToken");

/*
 * Routes to Create, Update, Delete Task
 */
router.post("/", verifyToken, taskController.createTask);
router.put("/:taskId", verifyToken, taskController.updateTask);
router.delete("/:taskId", verifyToken, taskController.deleteTask);
router.patch("/:taskId", verifyToken, taskController.updateTaskStatus);

/*
 * Routes to Create, Update, Delete CheckList
 */
router.post("/:taskId/checklist", verifyToken, taskController.createCheckList);
router.put(
  "/:taskId/checklist/:checkListId",
  verifyToken,
  taskController.updateCheckList
);
router.delete(
  "/:taskId/checklist/:checkListId",
  verifyToken,
  taskController.deleteCheckList
);

/*
 * Routes to Get Analytics Data
 */
router.get("/analytics", verifyToken, taskController.getAnalytics);

/*
 * Routes to Get Task, CheckList
 */
router.get("/", verifyToken, taskController.getAllTasks);
router.get("/:taskId", taskController.getTask);
router.get("/:taskId/checklists", verifyToken, taskController.getCheckList);

/*
 * Get Filtered ID's for Tasks
 */
router.post("/filtered-ids", verifyToken, taskController.getFilteredIds);

module.exports = router;
