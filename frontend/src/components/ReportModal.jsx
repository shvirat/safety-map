import { useState } from 'react';
import { reportService } from '../services/api';
import toast from 'react-hot-toast';
import { X, ShieldAlert, Calendar, Loader2, ImagePlus, MapPin, CheckCircle2 } from 'lucide-react';

const ReportModal = ({ location, onClose, onSubmitSuccess }) => {
  const [type, setType] = useState('suspicious activity');
  const [severity, setSeverity] = useState('Medium');
  const [datetime, setDatetime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image is too large. Max size is 5MB.');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await reportService.createReport({
        location,
        type,
        severity,
        datetime: new Date(datetime).toISOString(),
        description,
        imageFile
      });
      setSuccess(true);
      setTimeout(() => onSubmitSuccess(), 1500);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: 'theft', label: 'Theft', icon: '🔓' },
    { value: 'harassment', label: 'Harassment', icon: '⚠️' },
    { value: 'poor lighting', label: 'Poor Lighting', icon: '💡' },
    { value: 'accident', label: 'Accident', icon: '💥' },
    { value: 'suspicious activity', label: 'Suspicious', icon: '👁️' }
  ];

  const severities = [
    { value: 'Low', color: '#94a3b8', label: 'Low' },
    { value: 'Medium', color: '#3b82f6', label: 'Medium' },
    { value: 'High', color: '#f59e0b', label: 'High' },
    { value: 'Critical', color: '#ef4444', label: 'Critical' }
  ];

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 sm:p-6 overflow-y-auto animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>

      {/* ─── Success Screen ─── */}
      {success ? (
        <div className="bg-white rounded-3xl w-full max-w-[480px] p-10 text-center animate-slide-up"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: '#10b98118' }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: '#10b981' }} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Report Submitted</h3>
          <p className="text-sm text-slate-500">Your report has been submitted securely and is pending verification by our moderator team.</p>
        </div>
      ) : (

      /* ─── Form ─── */
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-h-[88vh] overflow-y-auto max-w-[520px] mt-auto sm:mt-0 animate-slide-up"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
      >

        {/* Header */}
        <div className="px-5 sm:px-7 pt-6 sm:pt-7 pb-4 flex justify-between items-start" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#6366f10d' }}>
                <ShieldAlert className="w-4.5 h-4.5" style={{ color: '#6366f1' }} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Report Incident</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">Your report will be reviewed before publishing.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 rounded-lg p-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location Badge */}
        <div className="px-5 sm:px-7 pt-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#f8f9fb', border: '1px solid #f1f5f9' }}>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-medium text-slate-500">
              {location?.lat?.toFixed(5)}, {location?.lng?.toFixed(5)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-5 space-y-5">

          {/* Incident Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
              Incident Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    type === t.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-[11px] leading-tight text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
              Severity Level <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              {severities.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSeverity(s.value)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all cursor-pointer"
                  style={{
                    background: severity === s.value ? s.color + '0d' : '#ffffff',
                    borderColor: severity === s.value ? s.color + '40' : '#e5e7eb',
                  }}
                >
                  <div className="w-3 h-3 rounded-full transition-colors"
                    style={{ background: severity === s.value ? s.color : '#d1d5db' }} />
                  <span className="text-[11px] font-semibold transition-colors"
                    style={{ color: severity === s.value ? s.color : '#94a3b8' }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Image row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Date Time */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Time of Incident <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="datetime-local"
                  required
                  className="w-full border text-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                  style={{ background: '#f8f9fb', borderColor: '#e5e7eb' }}
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                />
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Photo Evidence
              </label>
              {!previewUrl ? (
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:border-indigo-400 group"
                  style={{ borderColor: '#d1d5db' }}>
                  <ImagePlus className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Upload</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border group" style={{ borderColor: '#e5e7eb' }}>
                  <img src={previewUrl} alt="Evidence Preview" className="w-full h-20 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1.5 right-1.5 bg-slate-900/60 hover:bg-rose-600 p-1 rounded-lg text-white transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full border text-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none placeholder:text-slate-400"
              style={{ background: '#f8f9fb', borderColor: '#e5e7eb' }}
              rows="3"
              placeholder="Describe what happened — location details, time, anything relevant..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <p className="text-[11px] text-slate-500 font-medium text-center sm:text-left">
              Submitting <strong className="text-slate-700">anonymously</strong>
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto font-semibold py-2.5 px-7 rounded-xl transition-all flex justify-center items-center text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: '#18181b',
                color: '#ffffff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#27272a'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#18181b'; }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default ReportModal;
