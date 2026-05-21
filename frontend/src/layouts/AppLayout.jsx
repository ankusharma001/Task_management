import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../services/projectService';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  PlusCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectsList, setProjectsList] = useState([]);

  // Fetch actual project workspaces dynamically to display in the sidebar
  useEffect(() => {
    if (user) {
      getProjects().then(res => {
        if (res.success) {
          setProjectsList(res.projects);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-800">
            TaskBoard
          </span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 focus:outline-none"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 z-35 transition-transform duration-200 ease-in-out
        w-64 bg-white border-r border-slate-100 p-5 flex flex-col justify-between
        h-screen sticky top-0
      `}>
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Logo / Brand Header */}
          <div className="hidden md:flex items-center gap-2.5 mb-6 px-1">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">
              TaskBoard
            </span>
          </div>

          {/* "+ Add New" Action Trigger */}
          <button 
            onClick={() => {
              setSidebarOpen(false);
              navigate('/projects');
            }}
            className="w-full mb-5 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-750 text-white font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Workspace
          </button>

          {/* Core Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group
                    ${isActive 
                      ? 'bg-slate-50 text-violet-700 font-bold border-l-2 border-violet-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-650'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Project workspaces checklist in sidebar */}
          <div className="mt-8 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workspaces
              </span>
              <Link to="/projects" className="text-[9px] font-bold text-violet-650 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-0.5">
              {projectsList.map((p) => {
                const isCurrentProj = location.pathname.startsWith(`/projects/${p._id}`);
                return (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all truncate ${
                      isCurrentProj 
                        ? 'text-violet-700 bg-slate-50' 
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrentProj ? 'bg-violet-600' : 'bg-slate-300'}`} />
                      <span className="truncate">{p.title}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-300 shrink-0 -rotate-90" />
                  </Link>
                );
              })}
              {projectsList.length === 0 && (
                <div className="px-3.5 py-3 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-100 mt-2">
                  <span className="text-slate-400 text-[10px] italic block">No active workspaces</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Footer details */}
        <div className="pt-4 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-[11px] font-bold text-slate-800 truncate leading-none mb-0.5">{user?.name}</p>
                <span className="text-[9px] text-slate-400 font-semibold block uppercase leading-none">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* Header Navigation */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          
          {/* Top page title */}
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold tracking-tight text-slate-800 capitalize leading-none">
              {location.pathname === '/' 
                ? 'Dashboard' 
                : location.pathname.split('/')[1]}
            </h2>
          </div>

          {/* Right aligned user profile */}
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700 leading-none mb-0.5">{user?.name}</p>
                <span className="text-[9px] text-slate-400 font-semibold block uppercase leading-none">{user?.role}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Viewport content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
};

export default AppLayout;

