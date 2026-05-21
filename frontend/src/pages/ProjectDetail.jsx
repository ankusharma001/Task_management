import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjectById, addProjectMember, removeProjectMember } from '../services/projectService';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getAllUsers } from '../services/authService';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Trash2, 
  Edit2, 
  Calendar, 
  CheckSquare, 
  UserPlus, 
  AlertCircle,
  Play,
  CheckCircle,
  XCircle,
  FolderKanban,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Task Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [submittingTask, setSubmittingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        getProjectById(id),
        getTasks({ projectId: id })
      ]);

      if (projRes.success) {
        setProject(projRes.project);
      }
      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
      }

      // Pre-fetch all users to display as assignees in task modal
      const usersRes = await getAllUsers();
      if (usersRes.success) {
        setAllUsers(usersRes.users || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Invite member by email
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const res = await addProjectMember(id, inviteEmail);
      if (res.success) {
        toast.success(res.message || 'Member added to project successfully');
        setInviteEmail('');
        fetchProjectData(); // Sync member lists
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member. Email might not exist.');
    } finally {
      setInviting(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;
    
    try {
      const res = await removeProjectMember(id, memberId);
      if (res.success) {
        toast.success(res.message || 'Member removed successfully');
        fetchProjectData(); // Sync
      }
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  // Task controllers
  const handleOpenCreateTask = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignedTo('');
    setTaskPriority('Medium');
    setTaskStatus('Todo');
    
    // Set default due date to 3 days from now
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    setTaskDueDate(threeDays.toISOString().split('T')[0]);
    
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTaskId(task._id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskAssignedTo(task.assignedTo?._id || task.assignedTo || '');
    setTaskPriority(task.priority || 'Medium');
    setTaskStatus(task.status || 'Todo');
    
    // Format date for HTML input type="date"
    if (task.dueDate) {
      setTaskDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
    } else {
      setTaskDueDate('');
    }
    
    setTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await deleteTask(taskId);
      if (res.success) {
        toast.success('Task deleted successfully');
        setTasks(tasks.filter(t => t._id !== taskId));
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Inline transition status for quick updates!
  const handleTransitionStatus = async (taskId, nextStatus) => {
    try {
      const res = await updateTask(taskId, { status: nextStatus });
      if (res.success) {
        toast.success(`Task shifted to ${nextStatus}`);
        
        // Sync state locally
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDescription.trim() || !taskAssignedTo || !taskDueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmittingTask(true);
    try {
      if (editingTaskId) {
        // Edit flow
        const res = await updateTask(editingTaskId, {
          title: taskTitle,
          description: taskDescription,
          assignedTo: taskAssignedTo,
          priority: taskPriority,
          dueDate: taskDueDate,
          status: taskStatus
        });
        if (res.success) {
          toast.success('Task updated successfully');
          setTaskModalOpen(false);
          fetchProjectData();
        }
      } else {
        // Create flow
        const res = await createTask({
          title: taskTitle,
          description: taskDescription,
          projectId: id,
          assignedTo: taskAssignedTo,
          priority: taskPriority,
          dueDate: taskDueDate,
          status: taskStatus
        });
        if (res.success) {
          toast.success('Task added successfully');
          setTaskModalOpen(false);
          fetchProjectData();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred while saving task');
    } finally {
      setSubmittingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-650 rounded-full animate-spin" />
        <span className="text-slate-455 font-semibold animate-pulse text-xs tracking-wider">Syncing project board...</span>
      </div>
    );
  }

  // Filter tasks by columns
  const todoTasks = tasks.filter(t => t.status === 'Todo');
  const progressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const blockedTasks = tasks.filter(t => t.status === 'Blocked');

  const columns = [
    { name: 'To Do', key: 'Todo', tasks: todoTasks, icon: AlertCircle, color: 'text-slate-450 bg-slate-100/80 border-slate-200' },
    { name: 'In Progress', key: 'In Progress', tasks: progressTasks, icon: Play, color: 'text-violet-700 bg-violet-50 border-violet-100' },
    { name: 'Blocked', key: 'Blocked', tasks: blockedTasks, icon: XCircle, color: 'text-rose-700 bg-rose-50 border-rose-100' },
    { name: 'Completed', key: 'Completed', tasks: completedTasks, icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' }
  ];

  // Helper for priority badges
  const getPriorityColor = (p) => {
    switch (p) {
      case 'Urgent': return 'text-rose-700 bg-rose-50 border-rose-100';
      case 'High': return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'Medium': return 'text-slate-655 bg-slate-50 border-slate-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const isProjectAdmin = user?.role === 'Admin' || project?.createdBy?._id === user?._id;

  return (
    <div className="space-y-7 animate-fadeIn text-slate-800 text-left">
      
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/projects" 
          className="p-2.5 bg-white border border-slate-100 text-slate-500 hover:text-slate-800 rounded-xl shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <div>
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider block">Workspace Board</span>
          <h2 className="text-xl font-extrabold text-slate-800 leading-none mt-1">{project?.title}</h2>
        </div>
      </div>

      {/* Overview Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info detail block */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 lg:col-span-2 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/10 rounded-full blur-2xl" />
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">Project Deliverables</h3>
            <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium">{project?.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 pt-4 text-left">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Workspace Creator</span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">{project?.createdBy?.name || 'Admin'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Created On</span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">
                {project?.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Contributors Management Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 lg:col-span-1 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3.5">
              <Users className="w-4 h-4 text-violet-600" />
              Team Members ({project?.members?.length || 0})
            </h3>
            
            {/* Inline invite email form for Admins */}
            {isProjectAdmin && (
              <form onSubmit={handleInviteMember} className="flex gap-2 mb-3.5">
                <input
                  type="email"
                  required
                  placeholder="collaborator@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-150 focus:border-violet-500 text-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
                <button
                  type="submit"
                  disabled={inviting}
                  className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 shrink-0 cursor-pointer"
                  title="Add Collaborator"
                >
                  {inviting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </button>
              </form>
            )}

            {/* Members listings */}
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-violet-500 flex items-center justify-center font-bold text-white text-[11px] shrink-0 shadow-sm shadow-violet-200">
                    {project?.createdBy?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-850 leading-tight">{project?.createdBy?.name}</h5>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">Creator</span>
                  </div>
                </div>
              </div>

              {project?.members?.map((member) => (
                <div key={member._id} className="flex items-center justify-between group py-1.5 border-b border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-[11px] shrink-0">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-850 leading-tight">{member.name}</h5>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">{member.role}</span>
                    </div>
                  </div>
                  
                  {isProjectAdmin && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-1 rounded-lg text-rose-500/50 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-100 transition-all shrink-0 cursor-pointer"
                      title="Remove Collaborator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Task Kanban board */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-left">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-violet-600" />
              Task Kanban Board
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 font-semibold">Track workspace progress items or update task details and stages.</p>
          </div>
          {isProjectAdmin && (
            <button
              onClick={handleOpenCreateTask}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-violet-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>

        {/* Board column structures */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {columns.map((col) => (
            <div key={col.key} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-4 min-h-[500px]">
              
              {/* Header column title */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-150">
                <div className="flex items-center gap-2 text-left">
                  <col.icon className={`w-4 h-4 shrink-0 ${
                    col.key === 'Completed' ? 'text-emerald-500' : col.key === 'Blocked' ? 'text-rose-500' : col.key === 'In Progress' ? 'text-violet-650' : 'text-slate-400'
                  }`} />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-650">{col.name}</h4>
                </div>
                <span className="bg-white border border-slate-200/80 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                  {col.tasks.length}
                </span>
              </div>

              {/* Tasks list */}
              <div className="space-y-3.5 overflow-y-auto max-h-[550px] pr-1">
                {col.tasks.length === 0 ? (
                  <p className="text-slate-400 text-[10px] text-center py-12 font-bold uppercase tracking-wider italic">Empty Stage</p>
                ) : (
                  col.tasks.map((task) => {
                    const isTaskAssignee = task.assignedTo?._id === user?._id;
                    const canEditTask = isProjectAdmin || isTaskAssignee;

                    return (
                      <div 
                        key={task._id}
                        className="bg-white border border-slate-100 hover:border-violet-100/50 p-4 rounded-xl shadow-sm transition-all hover:scale-[1.01] hover:shadow flex flex-col justify-between gap-3.5 group text-left relative overflow-hidden"
                      >
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-violet-200/5 rounded-full blur-xl group-hover:bg-violet-250/10 transition-all pointer-events-none" />
                        
                        <div>
                          <div className="flex justify-between items-start gap-2 relative">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase border shrink-0 ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            
                            {/* Actions block */}
                            {isProjectAdmin && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditTask(task)}
                                  className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all border border-slate-150"
                                  title="Edit Task"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all border border-rose-100"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <h5 className="font-bold text-xs text-slate-800 mt-2.5 leading-snug line-clamp-2">
                            {task.title}
                          </h5>
                          <p className="text-slate-450 text-[11px] font-medium mt-1 line-clamp-3 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          {/* Due date */}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                          </div>

                          {/* Dynamic status selection dropdown */}
                          <div className="flex items-center justify-between gap-2 mt-1 relative">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 overflow-hidden">
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-500 shrink-0 shadow-inner">
                                {task.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span className="truncate max-w-[85px]">
                                {isTaskAssignee ? 'Me' : task.assignedTo?.name || 'Unassigned'}
                              </span>
                            </div>

                            {/* Dropdown status update triggers */}
                            {canEditTask ? (
                              <select
                                value={task.status}
                                onChange={(e) => handleTransitionStatus(task._id, e.target.value)}
                                className="bg-slate-50 border border-slate-150 text-[10px] text-violet-650 font-bold px-2 py-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 hover:border-slate-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%2520xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2520width%3D%22292.4%22%2520height%3D%22292.4%22%3E%3Cpath%2520fill%3D%22%237c3aed%22%2520d%3D%22M287%252069.4a17.6%252017.6%25200%25200%25200-13-5.4H18.4c-5%25200-9.3%25201.8-12.9%25205.4A17.6%252017.6%25200%25200%25200%25200%252082.4c0%25205%25201.8%25209.3%25205.4%252012.9l128%2520127.9c3.6%25203.6%25207.8%25205.4%252012.8%25205.4s9.2-1.8%252012.8-5.4L287%252095c3.5-3.5%25205.4-7.8%25205.4-12.8%25200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:7px] bg-[right_6px_center] bg-no-repeat pr-4.5"
                              >
                                <option value="Todo">To Do</option>
                                <option value="In Progress">Active</option>
                                <option value="Blocked">Blocked</option>
                                <option value="Completed">Done</option>
                              </select>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{task.status}</span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Task Creation/Editing Overlay Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setTaskModalOpen(false)} />
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-lg z-10 shadow-2xl relative animate-scaleUp text-left">
            <button
              onClick={() => setTaskModalOpen(false)}
              className="absolute top-4.5 right-4.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-850 mb-1">
              {editingTaskId ? 'Modify Task Details' : 'Initiate Project Task'}
            </h3>
            <p className="text-slate-400 text-xs mb-5 font-semibold">Set deadlines, priorities, and assign tasks to members.</p>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Design Landing Page Wireframes"
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-violet-500 rounded-xl text-slate-800 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows="3"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Detail work scope, deliverables, or checklist items..."
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-violet-500 rounded-xl text-slate-800 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all resize-none"
                />
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                  Assignee *
                </label>
                <select
                  required
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer appearance-none"
                >
                  <option value="">-- Choose project member --</option>
                  {/* Always let creator select themselves */}
                  <option value={project?.createdBy?._id}>{project?.createdBy?.name} (Creator)</option>
                  
                  {project?.members?.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                  Flow status
                </label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer appearance-none"
                >
                  <option value="Todo">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-550 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-600/10 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submittingTask && <div className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />}
                  Save Task Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
