import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService } from '../services/api';

const AdminLogin = () => {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await reportService.verifyAdmin(secret);
      if (response.success) {
        localStorage.setItem('adminSecret', secret);
        toast.success('Authentication successful', { icon: '🔐' });
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials provided');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-[45%] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          <div className="mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-2xl tracking-tight">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              SafetyMap
            </div>
            <p className="mt-2 text-sm text-slate-500 font-medium">Administrator Portal Access</p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Security Key</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-slate-50 focus:bg-white"
                    placeholder="Enter your admin token"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-3 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all disabled:opacity-75 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    'Authenticating...'
                  ) : (
                    <>
                      Sign in securely
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center">
            <button 
              onClick={() => navigate('/')} 
              className="text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>

      {/* Right side visual */}
      <div className="hidden lg:block relative flex-1 w-0">
        <div className="absolute inset-0 h-full w-full bg-slate-900 flex justify-center items-center overflow-hidden">
          {/* Decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute bottom-10 -left-20 w-120 h-120 rounded-full bg-emerald-500/10 blur-3xl"></div>
          
           <div className="relative z-10 w-full max-w-lg mx-auto p-12 text-center text-white">
             <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
               <ShieldCheck className="w-10 h-10 text-indigo-300" />
             </div>
             <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">Protecting Communities.</h2>
             <p className="text-lg text-slate-300 font-medium leading-relaxed">
               Access the moderator portal to review pending incidents, verify alerts, and keep the public map informative and safe for everyone.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
