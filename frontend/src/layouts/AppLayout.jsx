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
  Search,
  Bell,
  FileText,
  ChevronDown,
  PlusCircle,
  HelpCircle,
  Mail,
  Users2,
  LineChart,
  Settings2
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
      <div className="md:hidden bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-800">
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
        md:relative md:translate-x-0 z-35 transition-transform duration-300 ease-in-out
        w-64 bg-white border-r border-slate-100 p-5 flex flex-col justify-between
        h-screen sticky top-0
      `}>
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Logo / Brand Header */}
          <div className="hidden md:flex items-center gap-2.5 mb-5 px-1">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/10">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-850">
              TaskBoard
            </span>
          </div>

          {/* Subheader Dropdown Simulator */}
          <div className="flex items-center justify-between border border-slate-100 rounded-xl p-2.5 mb-4 bg-slate-50/50 shadow-sm relative group cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center font-bold text-[10px] text-violet-700 shrink-0">
                OP
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[11px] font-bold text-slate-700 block truncate leading-tight">OnPoint Studio</span>
                <span className="text-[9px] text-slate-400 block leading-none">Standard Plan</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>

          {/* "+ Add New" Action Trigger */}
          <button 
            onClick={() => {
              setSidebarOpen(false);
              navigate('/projects');
            }}
            className="w-full mb-5 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-violet-600/15 hover:shadow-violet-600/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            Add New
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
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group
                    ${isActive 
                      ? 'bg-violet-50 text-violet-750 border-l-4 border-violet-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon className={`w-4.5 h-4.5 transition-transform duration-205 group-hover:scale-105 ${isActive ? 'text-violet-650' : 'text-slate-450 group-hover:text-slate-700'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Simulated Inactive Links from Mockup */}
          <div className="space-y-1 mt-1 border-t border-slate-50 pt-2">
            <button 
              onClick={() => toast.success("Inbox feature coming soon!")}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-655" />
                <span>Inbox</span>
              </div>
              <span className="bg-violet-100 text-violet-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                3
              </span>
            </button>

            <button 
              onClick={() => toast.success("Analytics dashboard coming soon!")}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all group"
            >
              <LineChart className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-655" />
              <span>Analytics</span>
            </button>

            <button 
              onClick={() => toast.success("Settings panel coming soon!")}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all group"
            >
              <Settings2 className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-655" />
              <span>Settings</span>
            </button>
          </div>

          {/* Project workspaces checklist in sidebar */}
          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Add Projects
              </span>
              <Link to="/projects" className="text-[9px] font-bold text-violet-600 hover:underline">
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
                        ? 'text-violet-700 bg-violet-50/50' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrentProj ? 'bg-violet-650' : 'bg-slate-350'}`} />
                      <span className="truncate">{p.title}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-350 shrink-0 -rotate-90" />
                  </Link>
                );
              })}
              {projectsList.length === 0 && (
                <div className="px-3.5 py-3 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-100 mt-2">
                  <span className="text-slate-400 text-[10px] italic block">No active projects</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Footer details */}
        <div className="pt-4 border-t border-slate-100 space-y-3.5 bg-white">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-450 px-1">
            <button 
              onClick={() => toast.success("Simulating member invite dashboard...")}
              className="flex items-center gap-1.5 hover:text-violet-600 transition-colors cursor-pointer"
            >
              <Users2 className="w-4 h-4" />
              Invite Team
            </button>
            <button 
              onClick={() => toast.success("Open documentation guidelines")}
              className="flex items-center gap-1.5 hover:text-violet-600 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
          </div>

          <div className="border-t border-slate-50/80 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-655 to-indigo-655 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-[11px] font-bold text-slate-800 truncate leading-none mb-0.5">{user?.name}</p>
                <span className="text-[9px] text-slate-400 font-semibold block uppercase leading-none">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa]">
        
        {/* Header Navigation */}
        <header className="hidden md:flex items-center justify-between px-8 py-4.5 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm shadow-slate-100/30">
          
          {/* Top page title */}
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 capitalize leading-none">
              {location.pathname === '/' 
                ? 'Dashboard' 
                : location.pathname.split('/')[1]}
            </h2>
          </div>

          {/* Center mockup search bar */}
          <div className="flex-1 max-w-lg mx-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-full pl-10 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/10 shadow-sm transition-all"
            />
          </div>

          {/* Right aligned info parameters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toast.success("All systems are operational!")}
                className="p-2 rounded-full text-slate-450 hover:text-slate-750 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                title="System Logs"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toast.success("No unread notifications")}
                className="p-2 rounded-full text-slate-455 hover:text-slate-750 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-600" />
              </button>
            </div>
            
            <div className="w-px h-5 bg-slate-150" />
            
            <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
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
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
};

export default AppLayout;
