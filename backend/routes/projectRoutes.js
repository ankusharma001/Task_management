const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validateProject } = require('../validators/projectValidator');

// Apply protection to all routes
router.use(protect);

router.route('/')
  .post(authorize('Admin'), validateProject, createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject) // Controller checks if Admin or Creator
  .delete(deleteProject); // Controller checks if Admin or Creator

router.route('/:id/members')
  .post(addMember); // Controller checks if Admin or Creator

router.route('/:id/members/:userId')
  .delete(removeMember); // Controller checks if Admin or Creator

module.exports = router;
