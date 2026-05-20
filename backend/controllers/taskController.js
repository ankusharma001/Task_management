const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate, status } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role verification: Only Admin or Project Creator can add tasks
    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or the project creator can add tasks'
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      priority: priority || 'Medium',
      dueDate,
      status: status || 'Todo',
      createdBy: req.user._id
    });

    // Populate user and project info before returning
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, search } = req.query;

    const query = {};

    // Base scoping rules based on role
    if (req.user.role !== 'Admin') {
      // Find projects the user belongs to
      const userProjects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);

      // Members can see tasks in their projects OR tasks explicitly assigned to them
      query.$or = [
        { projectId: { $in: projectIds } },
        { assignedTo: req.user._id }
      ];
    }

    // Additional filters
    if (projectId) {
      // If member requested a specific project, ensure it's within their allowed scopes
      if (query.$or) {
        query.$and = [
          { projectId: projectId },
          { $or: query.$or }
        ];
        delete query.$or;
      } else {
        query.projectId = projectId;
      }
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Load parent project to inspect project ownership
    const project = await Project.findById(task.projectId);
    const isProjectCreator = project && project.createdBy.toString() === req.user._id.toString();

    // Check permissions
    if (req.user.role === 'Admin' || isProjectCreator) {
      // Admin/Creator can update EVERYTHING
      task.title = title !== undefined ? title : task.title;
      task.description = description !== undefined ? description : task.description;
      task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
      task.priority = priority !== undefined ? priority : task.priority;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
      task.status = status !== undefined ? status : task.status;
    } else {
      // Members
      // Rule: Member can ONLY update status, and ONLY if the task is assigned to them.
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update tasks assigned to other members'
        });
      }

      // If they try to modify anything other than 'status', block it
      if (
        title !== undefined ||
        description !== undefined ||
        assignedTo !== undefined ||
        priority !== undefined ||
        dueDate !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message: 'Members can only change the status of their assigned tasks'
        });
      }

      if (status !== undefined) {
        task.status = status;
      }
    }

    const updatedTask = await task.save();

    // Populate before return
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email role')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: populatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    const isProjectCreator = project && project.createdBy.toString() === req.user._id.toString();

    // Only Admin or project creator can delete tasks
    if (req.user.role !== 'Admin' && !isProjectCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or the project creator can delete tasks'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};
