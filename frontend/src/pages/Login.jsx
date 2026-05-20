import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn, CircleDot } from 'lucide-react';

const Login = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Toast for session expiry
  useEffect(() => {
    if (searchParams.get('expired')) {
      toast.error('Session expired, please sign in again');
    }
  }, [searchParams]);

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await login({ email, password });
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-800">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/10">
              <CircleDot className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-3xl tracking-tight text-slate-850">
              TaskBoard
            </span>
          </div>
          <p className="text-slate-450 mt-3 text-xs md:text-sm text-center font-semibold">
            Streamline your workflow and monitor project progress in real time.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100/40 relative">
          <h2 className="text-xl font-bold text-center text-slate-800 mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Email field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`
                    w-full bg-slate-50 border text-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all
                    ${formErrors.email ? 'border-rose-300' : 'border-slate-100 hover:border-slate-200'}
                  `}
                />
              </div>
              {formErrors.email && (
                <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`
                    w-full bg-slate-50 border text-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 transition-all
                    ${formErrors.password ? 'border-rose-300' : 'border-slate-100 hover:border-slate-200'}
                  `}
                />
              </div>
              {formErrors.password && (
                <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-750 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2 hover:shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer details */}
          <div className="mt-8 text-center text-xs font-semibold text-slate-400 border-t border-slate-50 pt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-violet-600 hover:text-violet-700 font-bold hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
