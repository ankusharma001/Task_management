import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../services/projectService';
import { getTasks } from '../services/taskService';
import { 
  FolderKanban, 
  CheckSquare, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Check,
  Flag
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
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin" />
        <span className="text-slate-400 font-semibold animate-pulse text-xs">Syncing Dashboard...</span>
      </div>
    );
  }

  // Calculate statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    return t.status !== 'Completed' && new Date(t.dueDate) < now;
  }).length;

  const myAssignedTasks = tasks.filter(t => t.assignedTo?._id === user?._id).length;

  // Split tasks for columns
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
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 text-slate-800 text-left">
      
      {/* Simple Welcome Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">
            You have <strong className="text-violet-600 font-bold">{myAssignedTasks} active tasks</strong> assigned to you.
          </p>
        </div>
        {user?.role === 'Admin' && (
          <Link
            to="/projects"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-755 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all self-start md:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </Link>
        )}
      </div>

      {/* Grid of clean statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Projects */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            <FolderKanban className="w-4.5 h-4.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Workspaces</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">{totalProjects}</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Active workspaces</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            <CheckSquare className="w-4.5 h-4.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Tasks</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">{totalTasks}</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Tasks created</p>
          </div>
        </div>

        {/* Completed Rate */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            <Check className="w-4.5 h-4.5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">{completedTasks}</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Done work items</p>
          </div>
        </div>

        {/* Overdue/Blocked Tasks */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Issues</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">{overdueTasks + blockedTasks}</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">{overdueTasks} overdue, {blockedTasks} blocked</p>
          </div>
        </div>

      </div>

      {/* Main active columns: "To do this week" & "To review" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card Left: To do this week */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">To do this week</h3>
            <Link to="/tasks" className="text-xs font-semibold text-violet-650 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {todoThisWeek.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium italic">
                No active tasks to do this week.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-650">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider pb-2">
                    <th className="py-2.5 font-bold">Name</th>
                    <th className="py-2.5 font-bold">Project</th>
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
                              ? 'text-rose-500' 
                              : 'text-slate-400'
                          }`} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400 font-medium truncate max-w-[130px]">
                        {task.projectId?.title || 'Main Workspace'}
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
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">To review</h3>
            <Link to="/tasks" className="text-xs font-semibold text-violet-650 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {toReview.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium italic">
                No items currently ready for review.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-650">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider pb-2">
                    <th className="py-2.5 font-bold">Name</th>
                    <th className="py-2.5 font-bold">Project</th>
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
                        {task.projectId?.title || 'Main Workspace'}
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

    </div>
  );
};

export default Dashboard;
