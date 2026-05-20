import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Award,
  Calendar,
  Lock,
  Layers,
  CheckCircle,
  Users
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-slate-800 text-left">
      {/* Profile Header Cards */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50/30 to-transparent border border-violet-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl -z-10" />
        
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center font-extrabold text-white text-3xl shadow-lg shadow-violet-600/10 ring-4 ring-white shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div className="text-center md:text-left flex-1 space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">{user?.name}</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              {user?.email}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-205 hidden md:block" />
            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
              user?.role === 'Admin' 
                ? 'text-rose-700 bg-rose-50 border-rose-100' 
                : 'text-emerald-700 bg-emerald-50 border-emerald-100'
            }`}>
              <Award className="w-3.5 h-3.5" />
              {user?.role} Account
            </span>
          </div>
        </div>
      </div>

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Details */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-violet-600" />
            Account Specifics
          </h3>

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Registered Name</span>
              <span className="text-slate-800 font-bold">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Email Address</span>
              <span className="text-slate-800 font-bold">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Role Assigned</span>
              <span className="text-violet-700 font-bold uppercase text-[10px] bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100/50">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">Auth Key Security</span>
              <span className="text-slate-550 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Active JWT Bearer
              </span>
            </div>
          </div>
        </div>

        {/* Permissions Guidelines cards */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
            Your Permissions Profile
          </h3>

          <div className="space-y-3.5 text-xs text-slate-500 font-semibold leading-relaxed">
            <p className="text-slate-450 leading-relaxed mb-4">
              Your account is registered as a <strong className="text-slate-700 font-bold">{user?.role}</strong> role. Under our RBAC security framework, you have the following clearances:
            </p>

            {user?.role === 'Admin' ? (
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Workspace Management:</strong> Build, customize status boards, and delete projects.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Team Management:</strong> Add or remove contributors from workspace panels.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Task Execution:</strong> Initiate new items, designate assignees, adjust priorities, and edit due dates.</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Workspace Navigation:</strong> View detailed structures of projects you belong to.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700">Work Transition:</strong> Move status boards (Todo, Active, Blocked, Done) on your own assigned tasks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 text-slate-400 mt-0.5">X</div>
                  <span className="text-slate-400 font-medium">Note: You must request your Administrator to add or remove members or update task content fields.</span>
                </li>
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
