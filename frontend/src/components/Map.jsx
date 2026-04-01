import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import toast from 'react-hot-toast';
import { reportService } from '../services/api';
import ReportModal from './ReportModal';
import { Crosshair, ShieldAlert, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix generic leaflet icon error just in case any default marker is used
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper for Marker Colors using refined SaaS palette
const getMarkerColor = (type, severity) => {
  if (severity === 'Critical') return '#e11d48'; // rose-600

  const colors = {
    'theft': '#f59e0b', // amber-500
    'harassment': '#f97316', // orange-500
    'poor lighting': '#64748b', // slate-500
    'accident': '#3b82f6', // blue-500
    'suspicious activity': '#8b5cf6' // violet-500
  };
  return colors[type] || '#3b82f6';
};

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

const MapComponent = () => {
  const [reports, setReports] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const DELHI_NCR_CENTER = [28.6139, 77.2090]; 

  useEffect(() => {
    fetchApprovedReports();
    detectUserLocation();
  }, []);

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

  const handleMapClick = (latlng) => {
    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
    setModalOpen(true);
  };

  const handleReportSubmit = () => {
    setModalOpen(false);
    toast.success('Report submitted securely. Pending verification.', {
      style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
    });
    fetchApprovedReports(); 
  };

  const focusUserLocation = () => {
    if (userLocation && mapRef) {
      mapRef.flyTo([userLocation.lat, userLocation.lng], 15, { animate: true, duration: 1.5 });
    } else {
      detectUserLocation();
      toast('Locating signal...', { icon: '📡' });
    }
  };

  return (
    <div className="relative h-screen w-full font-sans bg-slate-50 overflow-hidden">
      
      {/* Brand Header */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-1000 flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur border border-white/20 shadow-md sm:px-5 sm:py-3 px-3 py-2 rounded-xl sm:rounded-2xl">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">SafetyMap</h1>
          <p className="hidden sm:block text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Community Watch</p>
        </div>
      </div>

      {/* Action / Admin Link floating bottom left */}
      <div className="absolute bottom-6 left-4 z-1000">
        <Link 
          to="/admin" 
          className="bg-white/90 backdrop-blur leading-none p-3 sm:px-4 sm:py-3 rounded-xl shadow-sm border border-slate-200 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
        >
          <span className="hidden sm:inline">Admin Portal &rarr;</span>
          <ShieldAlert className="w-5 h-5 sm:hidden text-indigo-500" />
        </Link>
      </div>

      {/* Floating Action Hint Bottom Center */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-1000 pointer-events-none w-[90%] sm:w-auto flex justify-center">
        <div className="bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 border border-slate-700/50">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"></div>
          <span className="text-[13px] sm:text-sm font-medium text-white shadow-sm whitespace-nowrap">Tap anywhere to report</span>
        </div>
      </div>

      {/* Locate Me Button */}
      <button 
        onClick={focusUserLocation}
        className="absolute bottom-24 right-4 md:bottom-6 md:right-6 z-1000 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group"
        title="Find My Location"
      >
        <Navigation className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Map Container */}
      <MapContainer 
        center={DELHI_NCR_CENTER} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={setMapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <SearchField />
        <MapClickComponent onMapClick={handleMapClick} />

        {/* User Location */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#4f46e5', fillOpacity: 1 }}
          >
             <Popup className="custom-popup">
                <span className="font-semibold text-slate-800">You are here</span>
             </Popup>
          </CircleMarker>
        )}

        {/* Report Markers */}
        {reports.map((report) => (
          <CircleMarker 
            key={report._id} 
            center={[report.location.lat, report.location.lng]}
            radius={9}
            pathOptions={{ 
              color: '#ffffff', 
              weight: 2, 
              fillColor: getMarkerColor(report.type, report.severity), 
              fillOpacity: 0.95 
            }}
          >
            <Popup className="custom-popup">
              <div className="w-48 sm:w-56">
                <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                  <strong className="block text-[15px] font-bold capitalize text-slate-900 leading-tight">
                    {report.type}
                  </strong>
                  {report.severity && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
                      ${report.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 
                        report.severity === 'High' ? 'bg-amber-100 text-amber-700' : 
                        report.severity === 'Low' ? 'bg-slate-100 text-slate-600' : 
                        'bg-blue-100 text-blue-700'}`}>
                      {report.severity}
                    </span>
                  )}
                </div>
                
                {report.description ? (
                  <p className="text-[13px] text-slate-600 mb-3 leading-relaxed line-clamp-3">
                    {report.description}
                  </p>
                ) : (
                  <p className="text-[13px] text-slate-400 italic mb-3">No description provided</p>
                )}
                
                {report.imageUrl && (
                  <div className="overflow-hidden rounded-xl mb-3 border border-slate-100 shadow-sm">
                    <img src={report.imageUrl} alt="Incident" className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                {report.datetime && (
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-1 mt-1">
                    <span>{new Date(report.datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                    <span>{new Date(report.datetime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {modalOpen && (
        <ReportModal 
          location={selectedLocation} 
          onClose={() => setModalOpen(false)}
          onSubmitSuccess={handleReportSubmit}
        />
      )}
    </div>
  );
};

export default MapComponent;
