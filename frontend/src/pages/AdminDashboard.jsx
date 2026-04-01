import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, XCircle, MapPin, Map as MapIcon, 
  LogOut, Calendar, Activity, ArrowRight, LayoutDashboard,
  Clock, ShieldCheck, ChevronRight, X
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
      // If we had a selected report, update it
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
        setSelectedReport(null); // Return to list view
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'rejected': return 'bg-rose-100 text-rose-700 ring-rose-600/20';
      default: return 'bg-amber-100 text-amber-700 ring-amber-600/20';
    }
  };

  const getSeverityBadge = (severity) => {
    if (!severity) return null;
    const config = {
      'Low': 'bg-slate-100 text-slate-700 border-slate-200',
      'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
      'High': 'bg-orange-50 text-orange-700 border-orange-200',
      'Critical': 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${config[severity] || config['Medium']}`}>
        {severity} PRIOR
      </span>
    );
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 flex-shrink-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">SafetyMap</span>
              <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                Moderator Console
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <MapIcon className="w-4 h-4" />
                Live Map
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - List View */}
        <div className={`flex flex-col border-r border-slate-200 bg-slate-50/50 w-full lg:w-1/3 shrink-0 ${selectedReport ? 'hidden lg:flex' : 'flex'} h-full`}>
          
          <div className="p-4 border-b border-slate-200 bg-white">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <LayoutDashboard className="w-5 h-5 text-indigo-500" />
              Overview
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl">
              {[
                { id: 'pending', label: 'Needs Review', count: counts.pending },
                { id: 'approved', label: 'Published', count: counts.approved },
                { id: 'rejected', label: 'Archived', count: counts.rejected }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedReport(null); }}
                  className={`cursor-pointer flex-1 py-1.5 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.label}
                  <span className={`py-0.5 px-1.5 rounded-md text-[10px] ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                 <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200 border-b-indigo-600"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                 <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                 <p className="text-slate-500 text-sm font-medium">No {activeTab} reports right now.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div 
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    selectedReport?._id === report._id 
                      ? 'border-indigo-400 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-400' 
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2">
                      {report?.type || 'Unknown'}
                    </span>
                    {getSeverityBadge(report?.severity)}
                  </div>
                  <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {report?.datetime ? new Date(report.datetime).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : new Date(report.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {report?.description || <span className="italic opacity-60">No context added...</span>}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Detail Validation View */}
        {selectedReport ? (
          <div className="flex-1 overflow-y-auto bg-white flex flex-col w-full h-full relative">
            <button 
              onClick={() => setSelectedReport(null)}
              className="lg:hidden absolute top-4 right-4 z-400 bg-white rounded-full p-2 shadow-md border border-slate-200 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-20 p-6 md:p-10 md:pt-10 max-w-4xl mx-auto w-full">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                    {getSeverityBadge(selectedReport.severity)}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">{selectedReport.type}</h2>
                  <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Reported on: {new Date(selectedReport.datetime || selectedReport.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short'})}
                  </p>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdateStatus(selectedReport._id, 'approved')}
                      className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-sm"
                    >
                      Publish Alert <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedReport._id, 'rejected')}
                      className="px-4 flex items-center justify-center bg-white text-rose-600 font-semibold py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors tooltip"
                      title="Reject as Spam"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Discard
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Minimap for precise location validation */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[300px] z-0 relative">
                  <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">Location Validation</span>
                  </div>
                  {selectedReport.location?.lat && selectedReport.location?.lng ? (
                    <MapContainer 
                      key={selectedReport._id} // force re-render when changing reports
                      center={[selectedReport.location.lat, selectedReport.location.lng]} 
                      zoom={15} 
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                      <CircleMarker 
                        center={[selectedReport.location.lat, selectedReport.location.lng]}
                        radius={12}
                        pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#e11d48', fillOpacity: 0.9 }}
                      />
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-400">Invalid Location Data</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-sm p-3 z-1000 flex justify-between text-white text-xs">
                    <span>Lat: {selectedReport.location?.lat?.toFixed(6) || 'N/A'}</span>
                    <span>Lng: {selectedReport.location?.lng?.toFixed(6) || 'N/A'}</span>
                  </div>
                </div>

                {/* Details text content */}
                <div>
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-full flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Witness Account / Details</h3>
                    {selectedReport.description ? (
                      <p className="text-slate-700 leading-relaxed overflow-y-auto">
                        {selectedReport.description}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic">
                        No additional details provided by the eyewitness.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Huge Image View */}
              {selectedReport.imageUrl && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    Photographic Evidence
                  </h3>
                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <img src={selectedReport.imageUrl} alt="Validation Evidence" className="w-full max-h-[600px] object-contain bg-slate-100" />
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-white flex-col h-full relative">
             {/* Empty State when no report selected */}
             <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Select an Incident Review</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  Choose a report from the correct queue to begin your validation process.
                </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
