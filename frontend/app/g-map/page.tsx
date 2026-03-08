"use client"

import { useEffect, useState, useRef } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface Place {
  name: string
  vicinity: string
  lat: number
  lng: number
  distance: number
  mapsLink: string
  type: string
}

export default function GMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        },
        () => setError("Location access denied. Please allow location access."),
        { enableHighAccuracy: true }
      )
    } else {
      setError("Geolocation is not supported by your browser.")
    }
  }, [])

  useEffect(() => {
    if (!location || !mapRef.current) return
    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => resolve()
          document.head.appendChild(script)
        })
      }
      const L = (window as any).L
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
      const map = L.map(mapRef.current).setView([location.lat, location.lng], 14)
      mapInstanceRef.current = map
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)
      const userIcon = L.divIcon({
        html: `<div style="background:#003049;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: "",
      })
      L.marker([location.lat, location.lng], { icon: userIcon }).addTo(map).bindPopup("<b>📍 Your Location</b>").openPopup()
    }
    loadLeaflet()
  }, [location])

  useEffect(() => {
    if (!location) return
    fetchNearbyPlaces(location.lat, location.lng, selectedFacility)
  }, [location, selectedFacility])

  const fetchNearbyPlaces = async (lat: number, lng: number, facilityType: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const amenity = facilityType === "clinic" ? "clinic|doctors" : facilityType === "public" ? "hospital|health_post" : "hospital|clinic|doctors|pharmacy|health_post"
      const query = `[out:json][timeout:25];(node["amenity"~"${amenity}"](around:5000,${lat},${lng});way["amenity"~"${amenity}"](around:5000,${lat},${lng});node["healthcare"](around:5000,${lat},${lng}););out body center;`
      const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query })
      const data = await response.json()
      const results: Place[] = (data.elements || [])
        .filter((el: any) => el.tags?.name)
        .map((el: any) => {
          const elLat = el.lat || el.center?.lat
          const elLng = el.lon || el.center?.lon
          return {
            name: el.tags.name,
            vicinity: el.tags["addr:street"] || el.tags["addr:city"] || "Nearby",
            lat: elLat, lng: elLng,
            distance: getDistance(lat, lng, elLat, elLng),
            mapsLink: `https://www.openstreetmap.org/?mlat=${elLat}&mlon=${elLng}&zoom=17`,
            type: el.tags.amenity || el.tags.healthcare || "facility",
          }
        })
        .filter((p: Place) => p.lat && p.lng)
        .sort((a: Place, b: Place) => a.distance - b.distance)
        .slice(0, 20)
      setPlaces(results)
      updateMapMarkers(results)
    } catch {
      setError("Failed to fetch nearby facilities. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateMapMarkers = (newPlaces: Place[]) => {
    const L = (window as any).L
    if (!L || !mapInstanceRef.current) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    const icon = L.divIcon({
      html: `<div style="background:#c1121f;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: "",
    })
    newPlaces.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>🏥 ${place.name}</b><br/>${place.vicinity}<br/><small>${place.distance.toFixed(2)} km away</small>`)
      markersRef.current.push(marker)
    })
  }

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const focusOnPlace = (place: Place) => {
    if (mapInstanceRef.current) mapInstanceRef.current.setView([place.lat, place.lng], 17)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <Navbar className="fixed top-0 left-0 w-full bg-black shadow-md z-50" />
      <div className="flex-1 pt-20 px-4 pb-8">
        <h1 className="text-3xl font-bold mb-2 text-center">🏥 Accessible Healthcare Locations</h1>
        <p className="text-center text-gray-400 mb-6 text-sm">Powered by OpenStreetMap — 100% Free</p>
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-center">{error}</div>}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <label className="text-gray-300 text-sm">Facility Type:</label>
            <select value={selectedFacility} onChange={(e) => setSelectedFacility(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500">
              <option value="all">All Medical Facilities</option>
              <option value="public">Public / Govt Hospitals</option>
              <option value="private">Private Hospitals</option>
              <option value="clinic">Clinics & Doctors</option>
              <option value="medical">Medical Facilities</option>
            </select>
          </div>
        </div>
        {!location && !error && (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4"></div>
            Getting your location...
          </div>
        )}
        {location && (
          <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
            <div className="w-full lg:w-[60%] h-[450px] rounded-xl overflow-hidden border border-gray-700 shadow-xl">
              <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            </div>
            <div className="w-full lg:w-[40%] h-[450px] overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
                  Searching nearby facilities...
                </div>
              ) : places.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">🏥</p>
                  <p>No facilities found nearby.</p>
                </div>
              ) : (
                places.map((place, index) => (
                  <div key={index} onClick={() => focusOnPlace(place)}
                    className="border border-gray-700 p-4 rounded-xl bg-gray-900 hover:bg-gray-800 cursor-pointer transition-all hover:border-blue-500">
                    <p className="font-semibold text-blue-400 text-base">{place.name}</p>
                    <p className="text-gray-300 text-sm mt-1">{place.vicinity}</p>
                    <p className="text-gray-500 text-xs mt-1">{place.distance.toFixed(2)} km away • {place.type}</p>
                    <a href={place.mapsLink} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-500 hover:underline text-xs mt-2 inline-block">
                      View on OpenStreetMap →
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {places.length > 0 && <p className="text-center text-gray-500 text-sm mt-4">Found {places.length} facilities within 5km</p>}
      </div>
      <Footer className="w-full bg-black text-gray-400" />
    </div>
  )
}