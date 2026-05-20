const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || []
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'Admin') {
      // Admins see all projects
      projects = await Project.find({})
        .populate('createdBy', 'name email')
        .populate('members', 'name email role');
    } else {
      // Members see projects they created or are members of
      projects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id }
        ]
      })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role');
    }

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.path.id || req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Enforce authorization for members
    if (
      req.user.role !== 'Admin' &&
      project.createdBy.toString() !== req.user._id.toString() &&
      !project.members.some(member => member._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project'
      });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const { title, description, status, members } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only Admins or the creator can edit projects
    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or the project creator can edit projects'
      });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.status = status || project.status;
    if (members) {
      project.members = members;
    }

    const updatedProject = await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only Admins or the creator can delete projects
    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or the project creator can delete projects'
      });
    }

    // Delete associated tasks
    await Task.deleteMany({ projectId: project._id });
    // Remove project
    await Project.findByIdAndDelete(project._id);

    res.json({
      success: true,
      message: 'Project and all its tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project by Email
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide user email' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Auth check
    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    // Check if user is already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.json({
      success: true,
      message: `${userToAdd.name} added to project successfully`,
      members: project.members
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Auth check
    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove members' });
    }

    const userId = req.params.userId;
    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();

    // Re-assign tasks assigned to this user in this project back to creator or unassign
    // (Here we keep the tasks but they remain as is, or we can choose to unassign them)

    res.json({
      success: true,
      message: 'Member removed from project successfully',
      members: project.members
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
