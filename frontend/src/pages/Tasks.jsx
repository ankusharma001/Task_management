import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTask } from '../services/taskService';
import { getProjects } from '../services/projectService';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Calendar, 
  Layers, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FolderDot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Tasks = () => {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchTasksAndProjects = async () => {
    setLoading(true);
    try {
      // Build search params dynamically
      const params = {};
      if (search.trim()) params.search = search;
      if (selectedProject) params.projectId = selectedProject;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPriority) params.priority = selectedPriority;

      const [tasksRes, projectsRes] = await Promise.all([
        getTasks(params),
        getProjects()
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
      }
      if (projectsRes.success) {
        setProjects(projectsRes.projects);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tasks workspace');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes or manual trigger
  useEffect(() => {
    // Basic debounce style or click
    const delayDebounceFn = setTimeout(() => {
      fetchTasksAndProjects();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedProject, selectedPriority, selectedStatus]);

  // Transition task status
  const handleTransitionStatus = async (taskId, nextStatus) => {
    try {
      const res = await updateTask(taskId, { status: nextStatus });
      if (res.success) {
        toast.success(`Task shifted to ${nextStatus}`);
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unauthorized: Only assigned member or admin can change status');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedProject('');
    setSelectedPriority('');
    setSelectedStatus('');
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Urgent': return 'text-rose-700 bg-rose-50 border-rose-100';
      case 'High': return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'Medium': return 'text-slate-655 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Completed': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Blocked': return 'text-rose-700 bg-rose-50 border-rose-100';
      case 'In Progress': return 'text-violet-750 bg-violet-50 border-violet-100';
      default: return 'text-slate-705 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 text-left">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-violet-600" />
            Task Workspace Board
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">Cross-workspace queries, filtering by stage, project, or title.</p>
        </div>
        <button
          onClick={handleClearFilters}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer self-start md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      {/* Filter Options Bar */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-violet-500 rounded-xl text-slate-800 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
          />
        </div>

        {/* Project Selector */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
            <Layers className="w-4 h-4" />
          </span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all cursor-pointer appearance-none"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Priority Selector */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
            <AlertCircle className="w-4 h-4" />
          </span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all cursor-pointer appearance-none"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* Status Selector */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all cursor-pointer appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Todo">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task grids rendering */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-650 rounded-full animate-spin" />
          <span className="text-slate-450 font-semibold animate-pulse text-xs tracking-wider">Querying Tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl p-6 shadow-sm">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-450">No matching tasks found</h4>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Try resetting search filters or modify selection queries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isAssignedToMe = task.assignedTo?._id === user?._id;
            const isProjectAdmin = user?.role === 'Admin' || task.createdBy?._id === user?._id;
            const canEdit = isProjectAdmin || isAssignedToMe;

            return (
              <div 
                key={task._id} 
                className="bg-white border border-slate-100 hover:border-violet-100/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between gap-5 group relative overflow-hidden"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-violet-200/5 rounded-full blur-xl group-hover:bg-violet-250/10 transition-all pointer-events-none" />
                
                <div>
                  <div className="flex justify-between items-start gap-2 relative">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase shrink-0 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase shrink-0 ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    {task.projectId?._id && (
                      <Link 
                        to={`/projects/${task.projectId._id}`}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all border border-transparent hover:border-slate-100"
                        title="View Workspace"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  <h3 className="font-bold text-xs text-slate-800 mt-3 leading-snug line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-slate-450 text-[11px] font-medium mt-1 line-clamp-3 leading-relaxed min-h-[48px]">
                    {task.description}
                  </p>
                </div>

                <div className="space-y-3.5 pt-3.5 border-t border-slate-100">
                  {/* Date and Project indicator */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100/50 max-w-[120px] truncate">
                      <FolderDot className="w-3 h-3 shrink-0" />
                      <span className="truncate">{task.projectId?.title}</span>
                    </span>
                  </div>

                  {/* Assignee and Status switcher */}
                  <div className="flex items-center justify-between gap-4 mt-2 relative">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden font-semibold">
                      <div className="w-5.5 h-5.5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-500 shrink-0 shadow-inner">
                        {task.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="truncate max-w-[95px]">
                        {isAssignedToMe ? 'Me' : task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </div>

                    {/* Change status inline */}
                    {canEdit ? (
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
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;
