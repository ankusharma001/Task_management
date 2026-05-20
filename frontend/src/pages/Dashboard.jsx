import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../services/projectService';
import { getTasks } from '../services/taskService';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Box,
  ClipboardList,
  UserPlus2,
  MessageSquare,
  Check,
  Calendar,
  Flag,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projData, taskData] = await Promise.all([
          getProjects(),
          getTasks()
        ]);
        if (projData.success) setProjects(projData.projects);
        if (taskData.success) setTasks(taskData.tasks);
      } catch (error) {
        console.error("Dashboard error", error);
        toast.error("Could not fetch dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-650 rounded-full animate-spin" />
        <span className="text-slate-450 font-semibold animate-pulse text-xs tracking-wider">Syncing Dashboard...</span>
      </div>
    );
  }

  // Calculate statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Todo' || t.status === 'In Progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    return t.status !== 'Completed' && new Date(t.dueDate) < now;
  }).length;

  const myAssignedTasks = tasks.filter(t => t.assignedTo?._id === user?._id).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Split tasks for columns based on mockup
  // "To do this week" (first 5 Todo/In Progress tasks)
  const todoThisWeek = tasks
    .filter(t => t.status === 'Todo' || t.status === 'In Progress')
    .slice(0, 5);

  // "To review" (first 5 Completed/Blocked or High priority tasks)
  const toReview = tasks
    .filter(t => t.status === 'Completed' || t.status === 'Blocked' || t.priority === 'High' || t.priority === 'Urgent')
    .slice(0, 5);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Add date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' - 09:00AM';
  };

  return (
    <div className="space-y-7 animate-fadeIn text-slate-800">
      
      {/* Premium Light-Themed Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50/30 to-transparent border border-violet-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl -z-10" />
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-2 max-w-xl font-medium">
            Here's a breakdown of your current workspace dynamics. You have <strong className="text-violet-650 font-bold">{myAssignedTasks} tasks</strong> assigned to you this week.
          </p>
        </div>
        {user?.role === 'Admin' && (
          <Link
            to="/projects"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-violet-600/10 hover:shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        )}
      </div>

      {/* Action Shortcut Cards row (Directly matching TaskBoard Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Create Project */}
        <div 
          onClick={() => navigate('/projects')}
          className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-4.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Box className="w-5 h-5" />
          </div>
          <div className="overflow-hidden text-left">
            <h4 className="text-xs font-bold text-slate-800 leading-tight">Create Project</h4>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">Organize task to your project</span>
          </div>
        </div>

        {/* Card 2: Create Task */}
        <div 
          onClick={() => navigate('/tasks')}
          className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-4.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-650 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="overflow-hidden text-left">
            <h4 className="text-xs font-bold text-slate-800 leading-tight">Create Task</h4>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">Organize task to your project</span>
          </div>
        </div>

        {/* Card 3: Invite Team */}
        <div 
          onClick={() => toast.success("Invite Team Modal simulated!")}
          className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-4.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <UserPlus2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden text-left">
            <h4 className="text-xs font-bold text-slate-800 leading-tight">Invite Team</h4>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">Organize task to your project</span>
          </div>
        </div>

        {/* Card 4: Send Message */}
        <div 
          onClick={() => toast.success("Chat integration coming soon!")}
          className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-4.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-all">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="overflow-hidden text-left">
            <h4 className="text-xs font-bold text-slate-800 leading-tight">Send Message</h4>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">Organize task to your project</span>
          </div>
        </div>

      </div>

      {/* Grid of clean statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Projects */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-violet-100 hover:shadow-md transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <div className="bg-violet-50 p-2.5 rounded-xl text-violet-600 border border-violet-100/50 group-hover:bg-violet-600 group-hover:text-white transition-all">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Active
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800">{totalProjects}</h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">Total Workspaces</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-100 hover:shadow-md transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-650 border border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Tasks
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800">{totalTasks}</h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">Tasks Created</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-100 hover:shadow-md transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 border border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Rate
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800">{completionPercentage}%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-violet-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-slate-400 text-[11px] font-medium mt-2">Completed: {completedTasks} / {totalTasks}</p>
          </div>
        </div>

        {/* Overdue/Blocked Tasks */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-rose-100 hover:shadow-md transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 border border-rose-100/50 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {overdueTasks > 0 ? (
              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Action Req.
              </span>
            ) : (
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                On Track
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800">{overdueTasks}</h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">Overdue Tasks ({blockedTasks} Blocked)</p>
          </div>
        </div>

      </div>

      {/* Main mockup Columns: "To do this week" & "To review" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card Left: To do this week */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4.5 px-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">To do this week</h3>
            <Link to="/tasks" className="text-xs font-semibold text-violet-650 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {todoThisWeek.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs font-medium italic">
                No active tasks to do this week.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider pb-2">
                    <th className="py-2.5 font-bold">Name</th>
                    <th className="py-2.5 font-bold">Projects</th>
                    <th className="py-2.5 font-bold">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {todoThisWeek.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800 truncate max-w-[170px]">
                        <div className="flex items-center gap-2">
                          <Flag className={`w-3.5 h-3.5 shrink-0 ${
                            task.priority === 'Urgent' || task.priority === 'High' 
                              ? 'text-rose-500 fill-rose-500' 
                              : 'text-blue-500 fill-blue-500'
                          }`} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400 font-medium truncate max-w-[130px]">
                        {task.projectId?.title || 'Main Project'}
                      </td>
                      <td className="py-3 text-slate-450 font-semibold text-[11px]">
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Card Right: To Review */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4.5 px-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">To review</h3>
            <Link to="/tasks" className="text-xs font-semibold text-violet-650 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {toReview.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs font-medium italic">
                No items currently ready for review.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider pb-2">
                    <th className="py-2.5 font-bold">Name</th>
                    <th className="py-2.5 font-bold">Projects</th>
                    <th className="py-2.5 font-bold">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {toReview.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800 truncate max-w-[170px]">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0 text-emerald-500 bg-emerald-50 border border-emerald-100 rounded-full p-0.5 font-bold" />
                          <span className="truncate">{task.title}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400 font-medium truncate max-w-[130px]">
                        {task.projectId?.title || 'Main Project'}
                      </td>
                      <td className="py-3 text-slate-450 font-semibold text-[11px]">
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Analytics SVG Workload and Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column workload circular rate */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5.5 shadow-sm flex flex-col justify-between lg:col-span-1 min-h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Project Workload Rate</h3>
            <p className="text-slate-450 text-[11px] font-medium mt-1">Task completions relative to total workload</p>
          </div>
          
          <div className="flex justify-center items-center py-5">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-slate-100"
                  strokeWidth="9"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-violet-600 transition-all duration-700 ease-out"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - completionPercentage / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-800">{completionPercentage}%</span>
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider mt-0.5">Finished</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Pending Load</span>
              <span className="text-sm font-extrabold text-violet-650 mt-0.5 block">{pendingTasks}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Blocked Load</span>
              <span className="text-sm font-extrabold text-rose-600 mt-0.5 block">{blockedTasks}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Recent Activity timeline matching inspiration image */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5.5 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Activity</h3>
              <button onClick={() => toast.success("Logs timeline is up to date!")} className="text-xs font-semibold text-violet-650 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
              
              {/* Activity Item 1: Main Project completed */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 text-emerald-500 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    Main Project completed
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Today, 2:24pm</span>
                </div>
              </div>

              {/* Activity Item 2: Landing Page Project removed (with card comment Savannah Dune) */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100 text-rose-500 font-extrabold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-left w-full">
                  <p className="text-xs font-semibold text-slate-800">
                    Landing Page Project removed
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5 mb-2">Today, 2:24pm</span>
                  
                  {/* Styled comment sub-card exactly like the image */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 w-full shadow-inner max-w-lg">
                    <p className="italic leading-relaxed text-slate-500 text-[11px]">
                      "Removing this project because there's internal issues, will reach back once the project can start"
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center font-bold text-[9px] text-violet-700 shrink-0">
                        SD
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">Savannah Dune</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Item 3: Main Project completed */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 text-emerald-500 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    Main Project completed
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Today, 2:24pm</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
