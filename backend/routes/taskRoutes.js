const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validateTask } = require('../validators/taskValidator');

router.use(protect);

router.route('/')
  .post(validateTask, createTask) // Controller checks if Admin or Creator
  .get(getTasks);

router.route('/:id')
  .put(updateTask) // Controller checks if Admin, Creator, or Assigned Member
  .delete(deleteTask); // Controller checks if Admin or Creator

module.exports = router;
