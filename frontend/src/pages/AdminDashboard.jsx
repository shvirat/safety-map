import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, timeAgo } from '../services/api';
import toast from 'react-hot-toast';
import {
  CheckCircle2, XCircle, MapPin, Map as MapIcon,
  LogOut, Calendar, ArrowRight, LayoutDashboard,
  Clock, ShieldCheck, X, AlertTriangle, Eye, Archive
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();
  const adminSecret = localStorage.getItem('adminSecret');

  useEffect(() => {
    if (!adminSecret) {
      navigate('/admin');
      return;
    }
    fetchReports();
  }, [adminSecret, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getAllReports(adminSecret);
      setReports(data || []);

      if (selectedReport) {
        const updated = (data || []).find(r => r._id === selectedReport._id);
        setSelectedReport(updated || null);
      }
    } catch (error) {
      toast.error('Session expired or unauthorized');
      if (error.response?.status === 401) {
        localStorage.removeItem('adminSecret');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await reportService.updateReportStatus(id, status, adminSecret);
      toast.success(`Incident marked as ${status}`);
      fetchReports();
      if (selectedReport && selectedReport._id === id) {
        setSelectedReport(null);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminSecret');
    toast('Logged out successfully', { icon: '👋' });
    navigate('/admin');
  };

  const filteredReports = reports.filter(r => r?.status === activeTab);

  const counts = {
    pending: reports.filter(r => r?.status === 'pending').length,
    approved: reports.filter(r => r?.status === 'approved').length,
    rejected: reports.filter(r => r?.status === 'rejected').length,
  };

  const CATEGORY_CONFIG = {
    'theft': { icon: '🔓', color: '#f59e0b' },
    'harassment': { icon: '⚠️', color: '#ef4444' },
    'poor lighting': { icon: '💡', color: '#eab308' },
    'accident': { icon: '💥', color: '#8b5cf6' },
    'suspicious activity': { icon: '👁️', color: '#06b6d4' },
  };

  const getSeverityStyle = (severity) => {
    const map = {
      'Low': { color: '#94a3b8', bg: '#f1f5f9', border: '#e2e8f0' },
      'Medium': { color: '#3b82f6', bg: '#eff6ff', border: '#dbeafe' },
      'High': { color: '#f59e0b', bg: '#fffbeb', border: '#fed7aa' },
      'Critical': { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    };
    return map[severity] || map['Medium'];
  };

  const getStatusConfig = (status) => {
    const map = {
      'approved': { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', label: 'Published' },
      'rejected': { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Archived' },
      'pending': { color: '#f59e0b', bg: '#fffbeb', border: '#fed7aa', label: 'Pending' },
    };
    return map[status] || map['pending'];
  };

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden" style={{ background: '#fafafa' }}>

      {/* ─── Navbar ─── */}
      <nav className="shrink-0 z-30" style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#6366f1' }}>
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">SafetyMap</span>
              <span className="hidden sm:inline-block ml-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: '#f5f5f5', color: '#64748b', border: '1px solid #e5e7eb' }}>
                Moderator
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-none"
                style={{ color: '#64748b' }}
                onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Live Map</span>
              </button>
              <div className="h-5 w-px" style={{ background: '#e5e7eb' }} />
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none"
                style={{ color: '#64748b' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Stats Bar ─── */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="flex gap-3 sm:gap-4">
          {[
            { label: 'Pending Review', count: counts.pending, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Published', count: counts.approved, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Archived', count: counts.rejected, icon: Archive, color: '#94a3b8', bg: '#f8fafc' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-none">{stat.count}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex overflow-hidden">

        {/* Left — Report List */}
        <div className={`flex flex-col w-full lg:w-[380px] shrink-0 ${selectedReport ? 'hidden lg:flex' : 'flex'} h-full`}
          style={{ borderRight: '1px solid #e5e7eb' }}>

          {/* Tabs */}
          <div className="p-4 shrink-0" style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f5f5f5' }}>
              {[
                { id: 'pending', label: 'Review', count: counts.pending },
                { id: 'approved', label: 'Live', count: counts.approved },
                { id: 'rejected', label: 'Archive', count: counts.rejected }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedReport(null); }}
                  className="cursor-pointer flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all border-none"
                  style={{
                    background: activeTab === tab.id ? '#ffffff' : 'transparent',
                    color: activeTab === tab.id ? '#1e293b' : '#94a3b8',
                    boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {tab.label}
                  <span className="py-0.5 px-1.5 rounded-md text-[10px] font-bold"
                    style={{
                      background: activeTab === tab.id ? '#6366f10d' : '#e5e7eb',
                      color: activeTab === tab.id ? '#6366f1' : '#94a3b8'
                    }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Report List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#fafafa' }}>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200" style={{ borderBottomColor: '#6366f1' }} />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: '#d1d5db' }} />
                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>No {activeTab} reports.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const cat = CATEGORY_CONFIG[report?.type] || { icon: '📍', color: '#6366f1' };
                return (
                  <div
                    key={report._id}
                    onClick={() => setSelectedReport(report)}
                    className="p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: selectedReport?._id === report._id ? '#6366f108' : '#ffffff',
                      border: `1px solid ${selectedReport?._id === report._id ? '#6366f130' : '#e5e7eb'}`,
                      borderLeft: `3px solid ${cat.color}`
                    }}
                    onMouseEnter={e => { if (selectedReport?._id !== report._id) e.currentTarget.style.borderColor = '#d1d5db'; }}
                    onMouseLeave={e => { if (selectedReport?._id !== report._id) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-slate-900 capitalize">{report?.type || 'Unknown'}</span>
                          {report?.severity && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                              style={{
                                color: getSeverityStyle(report.severity).color,
                                background: getSeverityStyle(report.severity).bg
                              }}>
                              {report.severity}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 mb-1.5">
                          {report?.description || <span className="italic text-slate-400">No description...</span>}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{timeAgo(report?.datetime || report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right — Detail Panel */}
        {selectedReport ? (
          <div className="flex-1 overflow-y-auto flex flex-col w-full h-full relative" style={{ background: '#ffffff' }}>
            <button
              onClick={() => setSelectedReport(null)}
              className="lg:hidden absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ background: '#f5f5f5', border: '1px solid #e5e7eb', color: '#64748b' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-16 p-6 md:p-10 md:pt-10 max-w-4xl mx-auto w-full">

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {(() => {
                      const statusConf = getStatusConfig(selectedReport.status);
                      return (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide"
                          style={{ color: statusConf.color, background: statusConf.bg, border: `1px solid ${statusConf.border}` }}>
                          {statusConf.label}
                        </span>
                      );
                    })()}
                    {selectedReport.severity && (() => {
                      const sevStyle = getSeverityStyle(selectedReport.severity);
                      return (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide"
                          style={{ color: sevStyle.color, background: sevStyle.bg, border: `1px solid ${sevStyle.border}` }}>
                          {selectedReport.severity} Priority
                        </span>
                      );
                    })()}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_CONFIG[selectedReport.type]?.icon || '📍'}</span>
                    {selectedReport.type}
                  </h2>
                  <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {timeAgo(selectedReport.datetime || selectedReport.createdAt)} — {new Date(selectedReport.datetime || selectedReport.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'approved')}
                      className="flex items-center gap-2 text-white font-semibold py-2.5 px-5 rounded-xl transition-all text-sm cursor-pointer border-none"
                      style={{ background: '#10b981' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                      onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                    >
                      Publish <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'rejected')}
                      className="flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm cursor-pointer"
                      style={{ background: '#ffffff', color: '#ef4444', border: '1px solid #fecaca' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      <XCircle className="w-4 h-4" /> Discard
                    </button>
                  </div>
                )}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Minimap */}
                <div className="rounded-2xl overflow-hidden h-[300px] z-0 relative"
                  style={{ border: '1px solid #e5e7eb' }}>
                  <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
                    <span className="text-[11px] font-bold text-slate-700">Location</span>
                  </div>
                  {selectedReport.location?.lat && selectedReport.location?.lng ? (
                    <MapContainer
                      key={selectedReport._id}
                      center={[selectedReport.location.lat, selectedReport.location.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      <CircleMarker
                        center={[selectedReport.location.lat, selectedReport.location.lng]}
                        radius={12}
                        pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#ef4444', fillOpacity: 0.9 }}
                      />
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: '#f8f9fb' }}>
                      <span className="text-slate-400 text-sm">Invalid Location Data</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full py-2.5 px-4 z-10 flex justify-between text-xs font-mono"
                    style={{ background: 'rgba(12,12,16,0.85)', color: 'rgba(255,255,255,0.7)' }}>
                    <span>{selectedReport.location?.lat?.toFixed(6) || 'N/A'}</span>
                    <span>{selectedReport.location?.lng?.toFixed(6) || 'N/A'}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-2xl p-6 h-full flex flex-col"
                  style={{ background: '#f8f9fb', border: '1px solid #f1f5f9' }}>
                  <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Witness Details</h3>
                  {selectedReport.description ? (
                    <p className="text-slate-700 leading-relaxed text-sm flex-1">{selectedReport.description}</p>
                  ) : (
                    <p className="text-slate-400 italic text-sm">No details provided by the reporter.</p>
                  )}
                </div>
              </div>

              {/* Image */}
              {selectedReport.imageUrl && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Photographic Evidence</h3>
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                    <img src={selectedReport.imageUrl} alt="Evidence" className="w-full max-h-[500px] object-contain" style={{ background: '#f8f9fb' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center flex-col h-full" style={{ background: '#ffffff' }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: '#f5f5f5', border: '1px solid #e5e7eb' }}>
                <Eye className="w-7 h-7" style={{ color: '#d1d5db' }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Select a Report</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">
                Choose an incident from the list to review its details and take action.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
