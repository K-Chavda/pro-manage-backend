const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");

/*
 * Routes to Create, Update, Delete Task
 */
router.post("/", taskController.createTask);
router.put("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);

/*
 * Routes to Create, Update, Delete CheckList
 */
router.post("/:taskId/checklist", taskController.createCheckList);
router.put("/:taskId/checklist/:checkListId", taskController.updateCheckList);
router.delete(
  "/:taskId/checklist/:checkListId",
  taskController.deleteCheckList
);

/*
 * Routes to Get Task, CheckList
 */
router.get("/:taskId", taskController.getTask);
router.get("/:taskId/checklist/:checkListId", taskController.getCheckList);

module.exports = router;
