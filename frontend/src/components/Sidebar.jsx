import { useState, useEffect } from 'react';
import {
  X, Newspaper, AlertTriangle, Phone, SlidersHorizontal,
  ExternalLink, Clock, MapPin, PhoneCall, ChevronRight,
  Lightbulb, Shield, Search
} from 'lucide-react';
import { newsService, timeAgo } from '../services/api';

/* ─── Static Data ─── */
const HELPLINES = [
  {
    category: 'Emergency',
    items: [
      { name: 'Universal Emergency', number: '112', desc: 'Police, Fire, Ambulance', icon: '🚨' },
      { name: 'Police', number: '100', desc: 'Law enforcement', icon: '🚔' },
      { name: 'Fire Brigade', number: '101', desc: 'Fire emergencies', icon: '🚒' },
      { name: 'Ambulance', number: '108', desc: 'Medical emergencies', icon: '🚑' },
    ]
  },
  {
    category: "Women's Safety",
    items: [
      { name: 'Women Helpline', number: '181', desc: 'Domestic violence, abuse', icon: '👩‍🦰' },
      { name: 'Women in Distress', number: '1091', desc: 'Immediate assistance', icon: '📞' },
      { name: 'NCW Helpline', number: '14490', desc: 'National Commission', icon: '🛡️' },
    ]
  },
  {
    category: 'Other Essential',
    items: [
      { name: 'Child Helpline', number: '1098', desc: 'Child protection', icon: '👶' },
      { name: 'Cyber Crime', number: '1930', desc: 'Online fraud & crime', icon: '💻' },
      { name: 'Road Accident', number: '1073', desc: 'Traffic incidents', icon: '🛣️' },
      { name: 'Disaster Mgmt', number: '1070', desc: 'Natural calamities', icon: '⚡' },
    ]
  }
];

const SAFETY_TIPS = [
  "Always share your live location with a trusted contact when traveling alone.",
  "Avoid poorly lit areas at night. Stick to main roads with foot traffic.",
  "Keep emergency numbers saved on speed dial on your phone.",
  "Trust your instincts — if something feels wrong, move to a safe public space.",
  "Report suspicious activities promptly. Your report could save lives.",
  "Keep your phone charged when going out. Carry a power bank.",
  "Be aware of your surroundings. Avoid using headphones in isolated areas.",
  "When using ride-sharing, always verify the driver and vehicle details.",
  "Inform someone about your travel plans, especially for late-night commutes.",
  "Download the 112 India app for quick SOS alerts with location sharing."
];

const INCIDENT_TYPES = [
  { value: 'theft', label: 'Theft', color: '#f59e0b', icon: '🔓' },
  { value: 'harassment', label: 'Harassment', color: '#ef4444', icon: '⚠️' },
  { value: 'poor lighting', label: 'Poor Lighting', color: '#eab308', icon: '💡' },
  { value: 'accident', label: 'Accident', color: '#8b5cf6', icon: '💥' },
  { value: 'suspicious activity', label: 'Suspicious', color: '#06b6d4', icon: '👁️' },
];

const SEVERITIES = [
  { value: 'Low', color: '#94a3b8' },
  { value: 'Medium', color: '#3b82f6' },
  { value: 'High', color: '#f59e0b' },
  { value: 'Critical', color: '#ef4444' },
];

/* ─── Component ─── */
const Sidebar = ({ isOpen, onClose, reports, onFlyTo, filters, onFiltersChange }) => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (isOpen) fetchNews();
  }, [isOpen]);

  // Rotate safety tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % SAFETY_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const data = await newsService.getNews();
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const toggleTypeFilter = (type) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleSeverityFilter = (sev) => {
    const newSeverities = filters.severities.includes(sev)
      ? filters.severities.filter(s => s !== sev)
      : [...filters.severities, sev];
    onFiltersChange({ ...filters, severities: newSeverities });
  };

  const recentReports = [...(reports || [])]
    .sort((a, b) => new Date(b.datetime || b.createdAt) - new Date(a.datetime || a.createdAt))
    .slice(0, 15);

  const tabs = [
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'incidents', label: 'Reports', icon: AlertTriangle },
    { id: 'emergency', label: 'Helplines', icon: Phone },
    { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
  ];

  const getCategoryIcon = (type) => {
    return INCIDENT_TYPES.find(t => t.value === type)?.icon || '📍';
  };

  const getCategoryColor = (type) => {
    return INCIDENT_TYPES.find(t => t.value === type)?.color || '#6366f1';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop animate-fade-in" onClick={onClose} />
      )}

      {/* Panel */}
      <div className={`sidebar-panel ${isOpen ? 'sidebar-open' : ''}`}>

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-subtle)' }}>
              <Shield className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>SafetyMap</h2>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Community Watch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── SOS Banner ─── */}
        <div className="mx-4 mb-3">
          <a
            href="tel:112"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline"
            style={{ background: '#dc2626', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
            onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Emergency SOS</p>
              <p className="text-xs text-white/70 mt-0.5">Tap to call 112 — Police, Fire, Ambulance</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/50 shrink-0" />
          </a>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 px-4 pb-3" style={{ borderBottom: '1px solid var(--border-dark)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-3">

          {/* NEWS TAB */}
          {activeTab === 'news' && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Safety & Crime News
              </p>
              {newsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '80px' }} />
                ))
              ) : news.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No news available right now.</p>
              ) : (
                news.map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl p-3 transition-colors no-underline animate-slide-in-left"
                    style={{
                      background: 'var(--surface-card-dark)',
                      border: '1px solid var(--border-dark)',
                      animationDelay: `${i * 0.05}s`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-dark-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-card-dark)'}
                  >
                    <div className="flex gap-3">
                      {article.image && (
                        <img
                          src={article.image}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                          style={{ border: '1px solid var(--border-dark)' }}
                          onError={e => e.currentTarget.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-semibold leading-snug line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-medium">{article.source}</span>
                          <span>·</span>
                          <span>{timeAgo(article.publishedAt)}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {/* INCIDENTS TAB */}
          {activeTab === 'incidents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Recent Incidents
                </p>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ color: 'var(--accent)', background: 'var(--accent-subtle)' }}>
                  {reports?.length || 0}
                </span>
              </div>
              {recentReports.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No incidents reported yet.</p>
              ) : (
                recentReports.map((report, i) => (
                  <button
                    key={report._id}
                    onClick={() => {
                      onFlyTo(report.location.lat, report.location.lng);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className="w-full text-left rounded-xl p-3 transition-colors cursor-pointer animate-slide-in-left"
                    style={{
                      background: 'var(--surface-card-dark)',
                      border: '1px solid var(--border-dark)',
                      animationDelay: `${i * 0.04}s`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-dark-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-card-dark)'}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{ background: getCategoryColor(report.type) + '15' }}>
                        {getCategoryIcon(report.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[13px] font-semibold capitalize truncate" style={{ color: 'var(--text-primary)' }}>
                            {report.type}
                          </span>
                          {report.severity && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                              style={{
                                color: SEVERITIES.find(s => s.value === report.severity)?.color || '#94a3b8',
                                background: (SEVERITIES.find(s => s.value === report.severity)?.color || '#94a3b8') + '18'
                              }}>
                              {report.severity}
                            </span>
                          )}
                        </div>
                        {report.description && (
                          <p className="text-[12px] leading-relaxed line-clamp-1 mb-1" style={{ color: 'var(--text-secondary)' }}>
                            {report.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <Clock className="w-3 h-3" />
                          <span>{timeAgo(report.datetime || report.createdAt)}</span>
                          <span className="mx-1">·</span>
                          <MapPin className="w-3 h-3" />
                          <span>{report.location?.lat?.toFixed(3)}, {report.location?.lng?.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* EMERGENCY TAB */}
          {activeTab === 'emergency' && (
            <div className="space-y-5">
              {HELPLINES.map((group, gi) => (
                <div key={gi} className="animate-slide-in-left" style={{ animationDelay: `${gi * 0.08}s` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    {group.category}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item, i) => (
                      <a
                        key={i}
                        href={`tel:${item.number}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors no-underline"
                        style={{
                          background: 'var(--surface-card-dark)',
                          border: '1px solid var(--border-dark)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-dark-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-card-dark)'}
                      >
                        <span className="text-lg w-8 text-center">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{item.number}</span>
                          <PhoneCall className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FILTERS TAB */}
          {activeTab === 'filters' && (
            <div className="space-y-6">
              {/* Type filters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Incident Type
                  </p>
                  <button
                    onClick={() => {
                      const allTypes = INCIDENT_TYPES.map(t => t.value);
                      const allSelected = allTypes.every(t => filters.types.includes(t));
                      onFiltersChange({ ...filters, types: allSelected ? [] : allTypes });
                    }}
                    className="text-[11px] font-semibold cursor-pointer bg-transparent border-none"
                    style={{ color: 'var(--accent)' }}
                  >
                    {INCIDENT_TYPES.every(t => filters.types.includes(t.value)) ? 'Clear All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-1.5">
                  {INCIDENT_TYPES.map((type) => {
                    const active = filters.types.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        onClick={() => toggleTypeFilter(type.value)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                        style={{
                          background: active ? type.color + '10' : 'var(--surface-card-dark)',
                          border: `1px solid ${active ? type.color + '30' : 'var(--border-dark)'}`,
                        }}
                      >
                        <span className="text-base">{type.icon}</span>
                        <span className="flex-1 text-left text-[13px] font-medium" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {type.label}
                        </span>
                        <div className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                          style={{
                            borderColor: active ? type.color : 'var(--text-muted)',
                            background: active ? type.color : 'transparent'
                          }}>
                          {active && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity filters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Severity Level
                  </p>
                  <button
                    onClick={() => {
                      const allSev = SEVERITIES.map(s => s.value);
                      const allSelected = allSev.every(s => filters.severities.includes(s));
                      onFiltersChange({ ...filters, severities: allSelected ? [] : allSev });
                    }}
                    className="text-[11px] font-semibold cursor-pointer bg-transparent border-none"
                    style={{ color: 'var(--accent)' }}
                  >
                    {SEVERITIES.every(s => filters.severities.includes(s.value)) ? 'Clear All' : 'Select All'}
                  </button>
                </div>
                <div className="flex gap-2">
                  {SEVERITIES.map((sev) => {
                    const active = filters.severities.includes(sev.value);
                    return (
                      <button
                        key={sev.value}
                        onClick={() => toggleSeverityFilter(sev.value)}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors cursor-pointer"
                        style={{
                          background: active ? sev.color + '12' : 'var(--surface-card-dark)',
                          border: `1px solid ${active ? sev.color + '30' : 'var(--border-dark)'}`,
                        }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: active ? sev.color : 'var(--text-muted)' }} />
                        <span className="text-[11px] font-semibold" style={{ color: active ? sev.color : 'var(--text-muted)' }}>
                          {sev.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active filter summary */}
              <div className="rounded-xl p-3" style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Showing <strong style={{ color: 'var(--accent)' }}>{filters.types.length}</strong> types
                  and <strong style={{ color: 'var(--accent)' }}>{filters.severities.length}</strong> severity levels
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Safety Tip Footer ─── */}
        <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-dark)' }}>
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#eab308' }} />
            <p className="text-[12px] leading-relaxed transition-all" style={{ color: 'var(--text-secondary)' }}>
              {SAFETY_TIPS[tipIndex]}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
