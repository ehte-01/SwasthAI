"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Navigation, Filter, Phone, Calendar, ArrowLeft, Map, List } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
interface Place {
  name: string;
  vicinity: string;
  lat: number;
  lng: number;
  distance: number;
  mapsLink: string;
  type: string;
}

// ── Mock doctor data ─────────────────────────────────────────────────────────
const mockDoctors = [
  { id: 1, name: "Dr. Sarah Mitchell", specialty: "Cardiologist", photo: "https://ui-avatars.com/api/?name=Sarah+Mitchell&background=003049&color=fff&size=200", distance: 2.5, rating: 4.8, reviews: 156, experience: "15 years", hospital: "Apollo Hospital", available: true, phone: "+91 98765 43210", fee: "₹800" },
  { id: 2, name: "Dr. Rajesh Kumar", specialty: "Dentist", photo: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=669bbc&color=fff&size=200", distance: 1.2, rating: 4.9, reviews: 203, experience: "12 years", hospital: "Max Healthcare", available: true, phone: "+91 98765 43211", fee: "₹600" },
  { id: 3, name: "Dr. Priya Sharma", specialty: "Pediatrician", photo: "https://ui-avatars.com/api/?name=Priya+Sharma&background=c1121f&color=fff&size=200", distance: 3.8, rating: 4.7, reviews: 142, experience: "10 years", hospital: "Fortis Hospital", available: false, phone: "+91 98765 43212", fee: "₹700" },
  { id: 4, name: "Dr. Amit Patel", specialty: "Orthopedic", photo: "https://ui-avatars.com/api/?name=Amit+Patel&background=780000&color=fff&size=200", distance: 4.5, rating: 4.6, reviews: 98, experience: "18 years", hospital: "Medanta Hospital", available: true, phone: "+91 98765 43213", fee: "₹1000" },
  { id: 5, name: "Dr. Neha Gupta", specialty: "Dermatologist", photo: "https://ui-avatars.com/api/?name=Neha+Gupta&background=003049&color=fff&size=200", distance: 2.1, rating: 4.9, reviews: 187, experience: "8 years", hospital: "Columbia Asia", available: true, phone: "+91 98765 43214", fee: "₹900" },
  { id: 6, name: "Dr. Vikram Singh", specialty: "Neurologist", photo: "https://ui-avatars.com/api/?name=Vikram+Singh&background=669bbc&color=fff&size=200", distance: 5.2, rating: 4.8, reviews: 134, experience: "20 years", hospital: "AIIMS Delhi", available: false, phone: "+91 98765 43215", fee: "₹1200" },
  { id: 7, name: "Dr. Anjali Mehta", specialty: "Gynecologist", photo: "https://ui-avatars.com/api/?name=Anjali+Mehta&background=c1121f&color=fff&size=200", distance: 1.8, rating: 4.7, reviews: 176, experience: "14 years", hospital: "Lilavati Hospital", available: true, phone: "+91 98765 43216", fee: "₹850" },
  { id: 8, name: "Dr. Arjun Reddy", specialty: "General Physician", photo: "https://ui-avatars.com/api/?name=Arjun+Reddy&background=780000&color=fff&size=200", distance: 0.8, rating: 4.9, reviews: 245, experience: "11 years", hospital: "Apollo Clinic", available: true, phone: "+91 98765 43217", fee: "₹500" },
];

// ── Specialty tabs ────────────────────────────────────────────────────────────
const SPECIALTIES = ["All", "Cardiologist", "Dentist", "Pediatrician", "Orthopedic", "Dermatologist", "Neurologist", "Gynecologist", "General Physician"];
const SPECIALTY_ICONS: Record<string, string> = {
  All: "🏥", Cardiologist: "🫀", Dentist: "🦷", Pediatrician: "👶",
  Orthopedic: "🦴", Dermatologist: "🧴", Neurologist: "🧠",
  Gynecologist: "👩‍⚕️", "General Physician": "🩺",
};

// ── Haversine distance ────────────────────────────────────────────────────────
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function FindDoctor() {
  const router = useRouter();

  // ── List view state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [isLocating, setIsLocating] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  // ── View toggle ──
  const [activeView, setActiveView] = useState<"list" | "map">("list");

  // ── Map view state ──
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState("all");
  const [isMapLoading, setIsMapLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // ── Get GPS on map view open ──
  useEffect(() => {
    if (activeView !== "map") return;
    if (mapLocation) return;
    if (!navigator.geolocation) { setMapError("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMapError("Location access denied. Please allow location access."),
      { enableHighAccuracy: true }
    );
  }, [activeView]);

  // ── Load Leaflet map ──
  useEffect(() => {
    if (activeView !== "map" || !mapLocation || !mapRef.current) return;
    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css"; link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }
      const L = (window as any).L;
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      const map = L.map(mapRef.current).setView([mapLocation.lat, mapLocation.lng], 14);
      mapInstanceRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const userIcon = L.divIcon({
        html: `<div style="background:#003049;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: "",
      });
      L.marker([mapLocation.lat, mapLocation.lng], { icon: userIcon }).addTo(map).bindPopup("<b>📍 Your Location</b>").openPopup();
    };
    loadLeaflet();
  }, [mapLocation, activeView]);

  // ── Fetch nearby places ──
  useEffect(() => {
    if (activeView !== "map" || !mapLocation) return;
    fetchNearbyPlaces(mapLocation.lat, mapLocation.lng, selectedFacility);
  }, [mapLocation, selectedFacility, activeView]);

  const fetchNearbyPlaces = async (lat: number, lng: number, facilityType: string) => {
    setIsMapLoading(true); setMapError(null);
    try {
      const amenity = facilityType === "clinic" ? "clinic|doctors" : facilityType === "public" ? "hospital|health_post" : "hospital|clinic|doctors|pharmacy|health_post";
      const query = `[out:json][timeout:25];(node["amenity"~"${amenity}"](around:5000,${lat},${lng});way["amenity"~"${amenity}"](around:5000,${lat},${lng});node["healthcare"](around:5000,${lat},${lng}););out body center;`;
      const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query });
      const data = await response.json();
      const results: Place[] = (data.elements || [])
        .filter((el: any) => el.tags?.name)
        .map((el: any) => {
          const elLat = el.lat || el.center?.lat;
          const elLng = el.lon || el.center?.lon;
          return { name: el.tags.name, vicinity: el.tags["addr:street"] || el.tags["addr:city"] || "Nearby", lat: elLat, lng: elLng, distance: getDistance(lat, lng, elLat, elLng), mapsLink: `https://www.openstreetmap.org/?mlat=${elLat}&mlon=${elLng}&zoom=17`, type: el.tags.amenity || el.tags.healthcare || "facility" };
        })
        .filter((p: Place) => p.lat && p.lng)
        .sort((a: Place, b: Place) => a.distance - b.distance)
        .slice(0, 20);
      setPlaces(results);
      updateMapMarkers(results);
    } catch {
      setMapError("Failed to fetch nearby facilities. Please try again.");
    } finally {
      setIsMapLoading(false);
    }
  };

  const updateMapMarkers = (newPlaces: Place[]) => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const icon = L.divIcon({
      html: `<div style="background:#c1121f;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: "",
    });
    newPlaces.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>🏥 ${place.name}</b><br/>${place.vicinity}<br/><small>${place.distance.toFixed(2)} km away</small>`);
      markersRef.current.push(marker);
    });
  };

  const focusOnPlace = (place: Place) => {
    if (mapInstanceRef.current) mapInstanceRef.current.setView([place.lat, place.lng], 17);
  };

  // ── List filter/sort ──
  useEffect(() => {
    let filtered = mockDoctors.filter((doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedSpecialty !== "All") filtered = filtered.filter((d) => d.specialty === selectedSpecialty);
    if (sortBy === "distance") filtered = filtered.sort((a, b) => a.distance - b.distance);
    else if (sortBy === "rating") filtered = filtered.sort((a, b) => b.rating - a.rating);
    setFilteredDoctors(filtered);
  }, [searchQuery, sortBy, selectedSpecialty]);

  const handleUseLocation = () => {
    setIsLocating(true);
    setTimeout(() => { setIsLocating(false); setLocationEnabled(true); }, 1000);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={16} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Specialty Tabs Bar ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  selectedSpecialty === spec ? "bg-[#003049] text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{SPECIALTY_ICONS[spec]}</span>
                <span>{spec}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-blue-50 via-cyan-50 to-white py-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-[#003049] mb-4">Find Nearby Doctors 👨‍⚕️</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover qualified healthcare professionals near you. Book appointments with ease and get the care you deserve.</p>
          </motion.div>

          {/* ── View Toggle ── */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white rounded-2xl p-1.5 shadow-lg border border-gray-200 gap-1">
              <button
                onClick={() => setActiveView("list")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeView === "list" ? "bg-[#003049] text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List size={18} /> List View
              </button>
              <button
                onClick={() => setActiveView("map")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeView === "map" ? "bg-[#003049] text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Map size={18} /> Map View
              </button>
            </div>
          </div>

          {/* ════════════════ LIST VIEW ════════════════ */}
          {activeView === "list" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {/* Search and Filter */}
              <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name, specialty, or hospital..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#669bbc] focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-12 pr-8 py-4 rounded-xl border-2 border-gray-200 focus:border-[#669bbc] focus:outline-none transition-colors shadow-sm bg-white cursor-pointer appearance-none min-w-[200px]"
                    >
                      <option value="distance">Sort by Distance</option>
                      <option value="rating">Sort by Rating</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleUseLocation} disabled={isLocating}
                    className="px-6 py-4 bg-gradient-to-r from-[#003049] to-[#669bbc] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 justify-center disabled:opacity-50"
                  >
                    {isLocating ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Locating...</>) : (<><Navigation size={20} />Use My Location</>)}
                  </motion.button>
                </div>
                {locationEnabled && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <MapPin size={18} /><span className="font-medium">Showing doctors near you</span>
                  </motion.div>
                )}
              </div>

              {/* Doctors Grid */}
              {filteredDoctors.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                  <div className="text-8xl mb-4">😔</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No doctors found nearby</h3>
                  <p className="text-gray-500">Try adjusting your search or location settings</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDoctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <div className="relative">
                        <img src={doctor.photo} alt={doctor.name} className="w-full h-48 object-cover" />
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${doctor.available ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
                          {doctor.available ? "Available" : "Busy"}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-[#003049] mb-1">{doctor.name}</h3>
                        <p className="text-[#669bbc] font-medium mb-3">{doctor.specialty}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3"><MapPin size={14} className="text-[#c1121f]" /><span>{doctor.hospital}</span></div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3"><Navigation size={14} className="text-[#669bbc]" /><span className="font-semibold">{doctor.distance} km away</span></div>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(Math.floor(doctor.rating))}
                          <span className="text-sm font-bold text-gray-700">{doctor.rating}</span>
                          <span className="text-xs text-gray-500">({doctor.reviews} reviews)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                          <div><span className="font-semibold">Experience:</span><br />{doctor.experience}</div>
                          <div><span className="font-semibold">Fee:</span><br />{doctor.fee}</div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-gradient-to-r from-[#003049] to-[#669bbc] text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                            <Calendar size={18} />Book Now
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-[#fdf0d5] text-[#003049] p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <Phone size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredDoctors.length > 0 && (
                <div className="text-center mt-8 text-gray-600">
                  Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} {locationEnabled && "near you"}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════ MAP VIEW ════════════════ */}
          {activeView === "map" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {/* Facility Filter */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border border-gray-200">
                  <MapPin size={18} className="text-[#c1121f]" />
                  <label className="text-gray-600 text-sm font-medium">Facility Type:</label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:border-[#669bbc] text-sm"
                  >
                    <option value="all">All Medical Facilities</option>
                    <option value="public">Public / Govt Hospitals</option>
                    <option value="clinic">Clinics & Doctors</option>
                    <option value="medical">Medical Facilities</option>
                  </select>
                </div>
              </div>

              {/* Map Error */}
              {mapError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-center text-sm">{mapError}</div>
              )}

              {/* Location Loading */}
              {!mapLocation && !mapError && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003049] border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Getting your location...</p>
                  <p className="text-gray-400 text-sm mt-1">Please allow location access</p>
                </div>
              )}

              {/* Map + List */}
              {mapLocation && (
                <>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Map */}
                    <div className="w-full lg:w-[60%] h-[500px] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl">
                      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                    </div>

                    {/* Places List */}
                    <div className="w-full lg:w-[40%] h-[500px] overflow-y-auto space-y-3 pr-1">
                      {isMapLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#669bbc] border-t-transparent mx-auto mb-3"></div>
                          <p className="text-gray-500 text-sm">Searching nearby facilities...</p>
                        </div>
                      ) : places.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-5xl mb-3">🏥</p>
                          <p className="text-gray-500">No facilities found nearby.</p>
                        </div>
                      ) : (
                        places.map((place, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => focusOnPlace(place)}
                            className="border border-gray-200 p-4 rounded-xl bg-white hover:bg-blue-50 cursor-pointer transition-all hover:border-[#669bbc] shadow-sm hover:shadow-md"
                          >
                            <p className="font-semibold text-[#003049] text-base">{place.name}</p>
                            <p className="text-gray-500 text-sm mt-1">{place.vicinity}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">{place.distance.toFixed(2)} km away · {place.type}</span>
                              <a href={place.mapsLink} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#669bbc] hover:text-[#003049] text-xs font-medium hover:underline">
                                View Map →
                              </a>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {places.length > 0 && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Found <span className="font-semibold text-[#003049]">{places.length}</span> facilities within 5km
                    </p>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Back to Home */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#003049] rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-2 border-[#003049]"
            >
              <ArrowLeft size={20} />Back to Home
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}