import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, X, Loader2 } from "lucide-react";
import { CitySearchItem } from "../types";
import { api } from "../services/api";

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: string, lat?: number, lon?: number) => void;
  currentCity: string;
}

const FEATURED_CITIES: CitySearchItem[] = [
  { name: "Nagpur", state: "Maharashtra", country: "India", latitude: 21.1458, longitude: 79.0882 },
  { name: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090 },
  { name: "Mumbai", state: "Maharashtra", country: "India", latitude: 19.0760, longitude: 72.8777 },
  { name: "Bengaluru", state: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { name: "Pune", state: "Maharashtra", country: "India", latitude: 18.5204, longitude: 73.8567 },
  { name: "Kolkata", state: "West Bengal", country: "India", latitude: 22.5726, longitude: 88.3639 },
  { name: "Lucknow", state: "Uttar Pradesh", country: "India", latitude: 26.8467, longitude: 80.9462 },
  { name: "Kanpur", state: "Uttar Pradesh", country: "India", latitude: 26.4499, longitude: 80.3319 },
  { name: "Ahmedabad", state: "Gujarat", country: "India", latitude: 23.0225, longitude: 72.5714 },
  { name: "Hyderabad", state: "Telangana", country: "India", latitude: 17.3850, longitude: 78.4867 },
  { name: "Chandigarh", state: "Punjab/Haryana", country: "India", latitude: 30.7333, longitude: 76.7794 },
  { name: "Patna", state: "Bihar", country: "India", latitude: 25.5941, longitude: 85.1376 },
];

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  currentCity,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<CitySearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setGeoError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.searchCities(searchTerm);
        setResults(data);
      } catch {
        // filter locally
        const filtered = FEATURED_CITIES.filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your current browser.");
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocating(false);
        onSelectCity("My Location", position.coords.latitude, position.coords.longitude);
        onClose();
      },
      (error) => {
        setGeoLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError("Location access was denied. Please select a city manually or enable location permissions.");
        } else {
          setGeoError("Unable to acquire location coordinates. Please choose a city from the list.");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-search-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <h2 id="city-search-title" className="text-lg font-bold text-slate-900 font-['Outfit']">
              Select City or Location
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input & GPS Button */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              maxLength={100}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type city name (e.g., Nagpur, Delhi, Pune)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all"
              aria-label="Search city by name"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Current Location Button */}
          <button
            onClick={handleUseMyLocation}
            disabled={geoLocating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-sm font-semibold transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            {geoLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span>Acquiring GPS coordinates...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Use My Current Location</span>
              </>
            )}
          </button>

          {geoError && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg" role="alert">
              {geoError}
            </p>
          )}

          {/* Autocomplete Results or Featured List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-['Outfit']">
              {searchTerm ? "Search Results" : "Featured Indian Urban Centers"}
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {(searchTerm ? results : FEATURED_CITIES).map((item, idx) => {
                const isSelected = item.name.toLowerCase() === currentCity.toLowerCase();
                return (
                  <button
                    key={`${item.name}-${idx}`}
                    onClick={() => {
                      onSelectCity(item.name, item.latitude, item.longitude);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                      isSelected
                        ? "bg-emerald-100/80 text-emerald-900 font-bold border border-emerald-300"
                        : "hover:bg-slate-100 text-slate-800 border border-transparent"
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      {item.state && (
                        <span className="text-xs text-slate-500 ml-1.5">({item.state})</span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-xs bg-emerald-600 text-white font-medium px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}

              {searchTerm && !isSearching && results.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-500">
                  No cities found for "{searchTerm}". You can still try entering coordinates or choose from the list.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
          <span>Initial default: Nagpur (Central India reference)</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

