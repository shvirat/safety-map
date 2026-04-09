import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents, CircleMarker, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import toast from 'react-hot-toast';
import { reportService, timeAgo } from '../services/api';
import ReportModal from './ReportModal';
import Sidebar from './Sidebar';
import { Menu, ShieldAlert, Navigation, X, MapPin, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ─── Category & Severity Config ─── */
const CATEGORY_CONFIG = {
  'theft': { icon: '🔓', label: 'Theft', color: '#f59e0b' },
  'harassment': { icon: '⚠️', label: 'Harassment', color: '#ef4444' },
  'poor lighting': { icon: '💡', label: 'Poor Lighting', color: '#eab308' },
  'accident': { icon: '💥', label: 'Accident', color: '#8b5cf6' },
  'suspicious activity': { icon: '👁️', label: 'Suspicious Activity', color: '#06b6d4' },
};

const getMarkerColor = (type, severity) => {
  if (severity === 'Critical') return '#ef4444';
  return CATEGORY_CONFIG[type]?.color || '#6366f1';
};

const createPulseIcon = (color) => {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="pulse-container">
        <div class="pulse-ring" style="border-color: ${color}"></div>
        <div class="pulse-dot" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

/* ─── Sub-Components ─── */
const MapClickComponent = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const SearchField = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false,
      autoClose: true,
      searchLabel: 'Search places, streets...',
      position: 'topright'
    });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);
  return null;
};

/* ─── Main Component ─── */
const MapComponent = () => {
  const [reports, setReports] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    types: ['theft', 'harassment', 'poor lighting', 'accident', 'suspicious activity'],
    severities: ['Low', 'Medium', 'High', 'Critical']
  });

  const DELHI_NCR_CENTER = [28.6139, 77.2090];

  const fetchApprovedReports = async () => {
    try {
      const data = await reportService.getApprovedReports();
      setReports(data);
    } catch (error) {
      toast.error('Failed to load map data');
    }
  };

  const detectUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          if (mapRef) {
            mapRef.flyTo([loc.lat, loc.lng], 14, { animate: true });
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    fetchApprovedReports();
    detectUserLocation();
  }, []);

  const handleMapClick = (latlng) => {
    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
    setModalOpen(true);
  };

  const handleReportSubmit = () => {
    setModalOpen(false);
    toast.success('Report submitted. Pending verification.', {
      style: { borderRadius: '12px', background: '#18181f', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.06)' }
    });
    fetchApprovedReports();
  };

  const focusUserLocation = () => {
    if (userLocation && mapRef) {
      mapRef.flyTo([userLocation.lat, userLocation.lng], 15, { animate: true, duration: 1.5 });
    } else {
      detectUserLocation();
      toast('Locating signal...', { icon: '📡', style: { borderRadius: '12px', background: '#18181f', color: '#f0f0f5' } });
    }
  };

  const handleFlyTo = (lat, lng) => {
    if (mapRef) {
      mapRef.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
    }
  };

  // Apply filters
  const filteredReports = reports.filter(r =>
    filters.types.includes(r.type) && filters.severities.includes(r.severity)
  );

  const getSeverityStyle = (severity) => {
    const map = {
      'Critical': { color: '#ef4444', bg: '#ef444418' },
      'High': { color: '#f59e0b', bg: '#f59e0b18' },
      'Medium': { color: '#3b82f6', bg: '#3b82f618' },
      'Low': { color: '#94a3b8', bg: '#94a3b818' },
    };
    return map[severity] || map['Medium'];
  };

  return (
    <div className="relative h-screen w-full font-sans overflow-hidden" style={{ background: '#0c0c10' }}>

      {/* ─── Sidebar ─── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        reports={reports}
        onFlyTo={handleFlyTo}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* ─── Header ─── */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-12 h-12 rounded-xl flex items-center justify-center glass transition-all cursor-pointer"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          title="Open Menu"
        >
          <Menu className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
        </button>
        <div className="flex items-center gap-2.5 glass rounded-xl px-3 py-2.5"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <ShieldAlert className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
              SafetyMap
            </h1>
            {/* <p className="hidden sm:block text-[10px] font-semibold mt-0.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Community Watch
            </p> */}
          </div>
          {reports.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg" style={{ background: 'var(--accent-subtle)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
              <span className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>
                {reports.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Admin Link ─── */}
      <div className="hidden md:block absolute bottom-6 left-4 z-30">
        <Link
          to="/admin"
          className="glass flex items-center gap-2 leading-none p-3 sm:px-4 sm:py-3 rounded-xl text-xs font-semibold transition-colors no-underline"
          style={{ color: 'var(--text-secondary)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          <ShieldAlert className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="hidden sm:inline">Admin Portal</span>
        </Link>
      </div>

      {/* ─── CTA Bar ─── */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none w-[90%] sm:w-auto flex justify-center">
        <div className="glass rounded-full px-5 py-2.5 flex items-center gap-2.5"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', animation: 'subtlePulse 2s ease infinite' }} />
          <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
            Tap anywhere to report an incident
          </span>
        </div>
      </div>

      {/* ─── Filter Active Indicator ─── */}
      {(filters.types.length < 5 || filters.severities.length < 4) && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center" style={{ marginRight: '0' }}>
          <div className="glass rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {filteredReports.length}/{reports.length}
            </span>
          </div>
        </div>
      )}

      {/* ─── Location Button ─── */}
      <button
        onClick={focusUserLocation}
        className="absolute bottom-24 right-4 md:bottom-6 md:right-6 z-30 glass w-12 h-12 rounded-xl flex items-center justify-center transition-all group cursor-pointer"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        title="Find My Location"
      >
        <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" style={{ color: 'var(--text-primary)' }} />
      </button>

      {/* ─── Map ─── */}
      <MapContainer
        center={DELHI_NCR_CENTER}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={setMapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* <SearchField /> */}
        <MapClickComponent onMapClick={handleMapClick} />

        {/* User location blue dot */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  width: 16px;
                  height: 16px;
                  background-color: #6366f1;
                  border: 3px solid #ffffff;
                  border-radius: 50%;
                  box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
                "></div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
              popupAnchor: [0, -11]
            })}
          >
            <Popup className="custom-popup">
              <span className="font-semibold text-slate-800 text-sm pr-3 text-center">You are here</span>
            </Popup>
          </Marker>
        )}

        {/* Report Markers */}
        {filteredReports.map((report) => (
          <Marker
            key={report._id}
            position={[report.location.lat, report.location.lng]}
            icon={createPulseIcon(getMarkerColor(report.type, report.severity))}
          >
            <Popup className="custom-popup">
              <div className="w-56">
                {/* Header */}
                <div className="flex justify-start gap-2 items-center mb-2.5 pb-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{CATEGORY_CONFIG[report.type]?.icon || '📍'}</span>
                    <strong className="text-[14px] font-bold capitalize text-slate-900 leading-tight">
                      {report.type}
                    </strong>
                  </div>
                  {report.severity && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase"
                      style={{
                        color: getSeverityStyle(report.severity).color,
                        background: getSeverityStyle(report.severity).bg
                      }}>
                      {report.severity}
                    </span>
                  )}
                </div>

                {/* Description */}
                {report.description ? (
                  <p className="text-[12px] text-slate-600 mb-2.5 leading-relaxed line-clamp-3">
                    {report.description}
                  </p>
                ) : (
                  <p className="text-[12px] text-slate-400 italic mb-2.5">No description provided</p>
                )}

                {/* Image */}
                {report.imageUrl && (
                  <div
                    className="relative overflow-hidden rounded-lg mb-2.5 cursor-pointer group"
                    style={{ border: '1px solid #e5e7eb' }}
                    onClick={() => setPreviewImage(report.imageUrl)}
                  >
                    <img src={report.imageUrl} alt="Incident" className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-[10px] font-semibold uppercase px-2 py-1 bg-black/50 rounded-md">View</span>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                {report.datetime && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {/* <span>{timeAgo(report.datetime)}</span>
                    <span className="mx-0.5">·</span> */}
                    <span>{new Date(report.datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ─── Report Modal ─── */}
      {modalOpen && (
        <ReportModal
          location={selectedLocation}
          onClose={() => setModalOpen(false)}
          onSubmitSuccess={handleReportSubmit}
        />
      )}

      {/* ─── Image Preview Modal ─── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 cursor-zoom-out transition-all animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={previewImage}
            alt="Expanded evidence"
            className="w-auto h-auto max-w-full max-h-full sm:max-w-[95vw] sm:max-h-[90vh] object-contain rounded-xl pointer-events-auto cursor-default"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default MapComponent;
