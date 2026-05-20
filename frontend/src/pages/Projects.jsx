import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';
import { getAllUsers } from '../services/authService';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  X,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);

  const fetchProjectsAndUsers = async () => {
    try {
      const projRes = await getProjects();
      if (projRes.success) {
        setProjects(projRes.projects);
      }
      
      // If user is Admin, they can view/assign members
      if (user?.role === 'Admin') {
        const usersRes = await getAllUsers();
        if (usersRes.success) {
          setAllUsers(usersRes.users || []);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load project workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndUsers();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('active');
    setSelectedMembers([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingId(project._id);
    setTitle(project.title);
    setDescription(project.description);
    setStatus(project.status || 'active');
    setSelectedMembers(project.members?.map(m => m._id || m) || []);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also remove all its tasks.')) return;
    
    try {
      const res = await deleteProject(id);
      if (res.success) {
        toast.success(res.message || 'Project deleted successfully');
        setProjects(projects.filter(p => p._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleToggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Edit flow
        const res = await updateProject(editingId, { 
          title, 
          description, 
          status, 
          members: selectedMembers 
        });
        if (res.success) {
          toast.success('Workspace updated successfully');
          fetchProjectsAndUsers();
          setModalOpen(false);
        }
      } else {
        // Create flow
        const res = await createProject({ 
          title, 
          description, 
          members: selectedMembers 
        });
        if (res.success) {
          toast.success('Workspace created successfully');
          fetchProjectsAndUsers();
          setModalOpen(false);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-650 rounded-full animate-spin" />
        <span className="text-slate-450 font-semibold animate-pulse text-xs tracking-wider">Syncing workspaces...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      
      {/* Premium Header Panel */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-600" />
            Project Workspaces
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">Manage project frameworks and assign workspace contributors.</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-md shadow-violet-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl p-6 shadow-sm">
          <FolderKanban className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-700">No project workspaces yet</h3>
          <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto font-semibold">
            {user?.role === 'Admin' 
              ? 'Get started by creating your very first project workspace and invite team members.' 
              : 'You do not belong to any project workspaces yet. Ask your Administrator to add your email.'}
          </p>
          {user?.role === 'Admin' && (
            <button
              onClick={handleOpenCreate}
              className="mt-6 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              Initialize Workspace
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            return (
              <div 
                key={project._id} 
                className="bg-white border border-slate-100 hover:border-violet-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden text-left"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200/10 rounded-full blur-2xl group-hover:bg-violet-250/20 transition-all" />
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border uppercase ${
                      project.status === 'completed' 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                        : project.status === 'archived'
                        ? 'text-slate-500 bg-slate-50 border-slate-200'
                        : 'text-violet-750 bg-violet-50 border-violet-100'
                    }`}>
                      {project.status || 'Active'}
                    </span>
                    
                    {/* Admin Action Triggers */}
                    {user?.role === 'Admin' && (
                      <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(project)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all border border-transparent hover:border-slate-100"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 group-hover:text-violet-650 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  
                  <p className="text-slate-450 text-xs mt-2 line-clamp-3 leading-relaxed min-h-[48px] font-medium">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                  {/* Contributors summary */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.members?.length || 0} Members</span>
                  </div>

                  {/* Explore button */}
                  <Link
                    to={`/projects/${project._id}`}
                    className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all border border-slate-100"
                  >
                    Manage
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modern Sliding Overlay Modal for Create/Edit Projects */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-lg z-10 shadow-2xl relative animate-scaleUp text-left">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4.5 right-4.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-lg font-bold text-slate-850 mb-1">
              {editingId ? 'Edit Workspace' : 'Create Workspace'}
            </h3>
            <p className="text-slate-400 text-xs mb-5 font-semibold">Set up the structure and invite project team members.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Redesign v2"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe project deliverables, timelines, or scopes..."
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-violet-500 rounded-xl text-slate-800 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all resize-none"
                />
              </div>

              {/* Status (Only when editing) */}
              {editingId && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                    Workspace Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-violet-500 rounded-xl text-slate-700 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}

              {/* Member checklist */}
              <div>
                <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Assign Team Contributors</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Workspace Invites</span>
                </label>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl max-h-40 overflow-y-auto p-3 divide-y divide-slate-100">
                  {allUsers.length === 0 ? (
                    <p className="text-slate-450 text-[11px] py-3 text-center font-medium italic">No other members registered yet.</p>
                  ) : (
                    allUsers.map((u) => {
                      const isMe = u._id === user?._id;
                      return (
                        <div 
                          key={u._id} 
                          onClick={() => handleToggleMember(u._id)}
                          className="flex items-center justify-between py-2 px-1 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100/50"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(u._id)}
                              onChange={() => {}} // Controlled by div click
                              className="w-4 h-4 rounded border-slate-200 text-violet-600 focus:ring-violet-500 focus:ring-offset-white"
                            />
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-800">{u.name} {isMe && '(You)'}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{u.email}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            u.role === 'Admin' 
                              ? 'text-rose-700 bg-rose-50 border-rose-100' 
                              : 'text-slate-650 bg-slate-50 border-slate-200'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-550 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-600/10 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  Save Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
