import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService } from '../services/api';

const AdminLogin = () => {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
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
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(error.response?.data?.message || 'Invalid credentials provided');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#fafafa' }}>
      {/* Left side — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:flex-none lg:w-1/2 xl:w-[45%] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">

          {/* Logo */}
          <div className="mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#6366f1' }}>
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight">SafetyMap</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Administrator Portal Access</p>
          </div>

          {/* Form */}
          <div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Security Key</label>
                <div className={`relative ${shake ? 'animate-shake' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full rounded-xl py-3.5 pl-11 pr-4 text-slate-900 text-sm outline-none transition-all"
                    style={{
                      background: '#f5f5f5',
                      border: '1px solid #e5e7eb',
                      boxShadow: 'none'
                    }}
                    onFocus={e => { e.target.style.background = '#ffffff'; e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                    onBlur={e => { e.target.style.background = '#f5f5f5'; e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
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
                  className="flex w-full justify-center items-center gap-2 rounded-xl px-3 py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                  style={{ background: '#18181b' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#27272a'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#18181b'; }}
                >
                  {loading ? (
                    'Authenticating...'
                  ) : (
                    <>
                      Sign in securely
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-6 flex items-center justify-center" style={{ borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => navigate('/')}
              className="text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none"
              style={{ color: '#6366f1' }}
            >
              ← Return to Map
            </button>
          </div>
        </div>
      </div>

      {/* Right side — Visual */}
      <div className="hidden lg:block relative flex-1 w-0">
        <div className="absolute inset-0 h-full w-full flex justify-center items-center overflow-hidden"
          style={{ background: '#0c0c10' }}>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />

          {/* Accent glow — very subtle, not gradient-heavy */}
          <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-30"
            style={{ background: '#6366f1', filter: 'blur(120px)' }} />

          <div className="relative z-10 w-full max-w-lg mx-auto p-12 text-center">
            <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <ShieldCheck className="w-10 h-10" style={{ color: '#6366f1' }} />
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">Protecting Communities.</h2>
            <p className="text-lg font-medium leading-relaxed" style={{ color: '#8b8b9e' }}>
              Review pending incidents, verify alerts, and keep the public safety map accurate for everyone.
            </p>

            {/* Stats preview */}
            <div className="flex justify-center gap-4 mt-10">
              {[
                { label: 'Reports', value: '24/7' },
                { label: 'Response', value: '< 5min' },
                { label: 'Coverage', value: 'Pan-India' }
              ].map((stat, i) => (
                <div key={i} className="px-5 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs font-medium" style={{ color: '#5a5a6e' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shake animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}} />
    </div>
  );
};

export default AdminLogin;
