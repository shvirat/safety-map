import { useState } from 'react';
import { reportService } from '../services/api';
import toast from 'react-hot-toast';
import { X, Camera, ShieldAlert, Calendar, Loader2, ImagePlus } from 'lucide-react';

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
      onSubmitSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: 'theft', label: 'Theft' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'poor lighting', label: 'Poor Lighting' },
    { value: 'accident', label: 'Accident' },
    { value: 'suspicious activity', label: 'Suspicious Activity' }
  ];

  const severities = [
    { value: 'Low', color: 'text-slate-600', activeBg: 'bg-slate-100', dot: 'bg-slate-400' },
    { value: 'Medium', color: 'text-amber-700', activeBg: 'bg-amber-50', dot: 'bg-amber-400' },
    { value: 'High', color: 'text-orange-700', activeBg: 'bg-orange-50', dot: 'bg-orange-500' },
    { value: 'Critical', color: 'text-rose-700 font-semibold', activeBg: 'bg-rose-50', dot: 'bg-rose-600 animate-pulse' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[2000] sm:p-6 overflow-y-auto">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-[520px] shadow-2xl overflow-hidden mt-16 sm:my-8 border border-white/20 transform transition-all"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        
        {/* Header */}
        <div className="px-8 pt-8 pb-5 flex justify-between items-start border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100/50">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report Incident</h2>
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">Your report will be reviewed by local authorities to ensure community safety.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          
          {/* Incident Type */}
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Incident Category <span className="text-rose-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    type === t.value 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Severity Level */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Severity Level <span className="text-rose-500">*</span></label>
              <div className="flex flex-col gap-2">
                {severities.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSeverity(s.value)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                      severity === s.value 
                        ? `border-${s.color.split('-')[1]}-200 ${s.activeBg} ${s.color} shadow-sm ring-1 ring-inset ring-${s.color.split('-')[1]}-200`
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${s.dot}`}></div>
                    {s.value}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Date Time */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">Time of Incident <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                  />
                </div>
              </div>

              {/* Enhanced Image File Input */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">Photo Evidence (Optional)</label>
                {!previewUrl ? (
                  <label className="w-full flex justify-center px-4 py-4 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors group">
                    <div className="space-y-1 text-center">
                      <ImagePlus className="mx-auto h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <span className="relative font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                          Take a photo
                        </span>
                        <p className="pl-1">or browse</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={previewUrl} alt="Evidence Preview" className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">Description (Optional)</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm resize-none placeholder:text-slate-400"
              rows="3"
              placeholder="Provide specific details like suspect appearance, exact scenarios, or vehicle numbers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[12px] text-slate-500 font-medium">
              Information is submitted <strong className="text-slate-700">anonymously</strong>.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:bg-indigo-700 transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default ReportModal;
