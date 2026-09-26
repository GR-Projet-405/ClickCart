import React, { useState, useEffect, useRef } from "react";
import { Map, MapPin, Plus, Minus, Navigation, Info } from "lucide-react";
import "./LocationPreview.css";

export default function LocationPreview({
  cityName,
  district,
  postalCode,
  radiusKm = 10,
  latitude = 6.9271,
  longitude = 79.8612,
}) {
  const [zoom, setZoom] = useState(11);
  const [tileError, setTileError] = useState(false);
  const canvasRef = useRef(null);

  // Sri Lanka major city coordinate presets
  const cityPresets = {
    colombo: { lat: 6.9271, lon: 79.8612, district: "Western Province" },
    maharagama: { lat: 6.848, lon: 79.9265, district: "Western Province" },
    kandy: { lat: 7.2906, lon: 80.6337, district: "Central Province" },
    gampaha: { lat: 7.084, lon: 79.9939, district: "Western Province" },
    negombo: { lat: 7.2008, lon: 79.8736, district: "Western Province" },
    matara: { lat: 5.9549, lon: 80.555, district: "Southern Province" },
    galle: { lat: 6.0535, lon: 80.221, district: "Southern Province" },
    jaffna: { lat: 9.6615, lon: 80.0255, district: "Northern Province" },
    dehiwala: { lat: 6.8344, lon: 79.8705, district: "Western Province" },
    battaramulla: { lat: 6.8997, lon: 79.9221, district: "Western Province" },
    nugegoda: { lat: 6.8724, lon: 79.8997, district: "Western Province" },
    moratuwa: { lat: 6.773, lon: 79.8816, district: "Western Province" },
  };

  const cleanCity = (cityName || "").trim().toLowerCase();
  const matched = cityPresets[cleanCity];

  const currentLat = matched ? matched.lat : (latitude || 6.9271);
  const currentLon = matched ? matched.lon : (longitude || 79.8612);
  const displayDistrict = district || (matched ? matched.district : "Western Province");
  const displayCity = cityName || "Colombo";
  const numRadius = Number(radiusKm) || 10;

  // Convert lat/lon to OpenStreetMap tile coordinates
  const lon2tile = (lon, z) => Math.floor(((lon + 180) / 360) * Math.pow(2, z));
  const lat2tile = (lat, z) =>
    Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, z)
    );

  const centerTileX = lon2tile(currentLon, zoom);
  const centerTileY = lat2tile(currentLat, zoom);

  // Radius calculation in pixels based on zoom level
  // 1 km at equator is approx 1/(40075 * cos(lat)) * 256 * 2^zoom
  const metersPerPixel = (156543.03392 * Math.cos((currentLat * Math.PI) / 180)) / Math.pow(2, zoom);
  const radiusPixels = Math.max(30, Math.min(220, (numRadius * 1000) / metersPerPixel));

  return (
    <div className="cc-location-preview-card">
      <div className="cc-location-preview__header">
        <div className="cc-location-preview__title-wrap">
          <div className="cc-location-preview__icon-badge">
            <Map size={18} />
          </div>
          <div>
            <h3 className="cc-location-preview__title">Location Preview</h3>
            <p className="cc-location-preview__subtitle">
              This is how your service area will look on the map.
            </p>
          </div>
        </div>
      </div>

      <div className="cc-map-container" aria-label={`Coverage map preview for ${displayCity}`}>
        {/* Map Tile Grid */}
        <div className="cc-map-tiles-wrap">
          {[-1, 0, 1].map((offsetX) =>
            [-1, 0, 1].map((offsetY) => {
              const tx = centerTileX + offsetX;
              const ty = centerTileY + offsetY;
              const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
              return (
                <img
                  key={`${zoom}-${tx}-${ty}`}
                  src={tileUrl}
                  alt=""
                  className="cc-map-tile"
                  style={{
                    transform: `translate(${offsetX * 256}px, ${offsetY * 256}px)`,
                  }}
                  onError={() => setTileError(true)}
                />
              );
            })
          )}
        </div>

        {/* Fallback pattern if offline */}
        {tileError && (
          <div className="cc-map-fallback-grid">
            <div className="cc-map-fallback-banner">
              <Info size={14} />
              <span>Offline / Standard Map Preview</span>
            </div>
          </div>
        )}

        {/* Center Coverage Radius Overlay */}
        <div
          className="cc-coverage-circle"
          style={{
            width: `${radiusPixels * 2}px`,
            height: `${radiusPixels * 2}px`,
          }}
        >
          <span className="cc-coverage-city-label">{displayCity}</span>
        </div>

        {/* Center Pinpoint Marker */}
        <div className="cc-center-marker" title={`${displayCity} Center`}>
          <div className="cc-marker-pin">
            <MapPin size={24} fill="#10b926" color="#ffffff" />
          </div>
          <div className="cc-marker-shadow" />
        </div>

        {/* Floating Top-Left Location Badge matching Screenshot 2 */}
        <div className="cc-floating-location-card">
          <div className="cc-floating-location-icon">
            <MapPin size={16} />
          </div>
          <div className="cc-floating-location-info">
            <strong className="cc-floating-city">{displayCity}</strong>
            <span className="cc-floating-details">
              {displayDistrict}, Sri Lanka
            </span>
          </div>
        </div>

        {/* Map Controls */}
        <div className="cc-map-controls">
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={() => setZoom((z) => Math.min(16, z + 1))}
            title="Zoom In"
            aria-label="Zoom in map"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={() => setZoom((z) => Math.max(8, z - 1))}
            title="Zoom Out"
            aria-label="Zoom out map"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={() => setZoom(11)}
            title="Reset Location"
            aria-label="Center on selected city"
          >
            <Navigation size={16} />
          </button>
        </div>

        {/* Radius Badge in Bottom Left */}
        <div className="cc-map-radius-badge">
          <span>Radius: <strong>{numRadius} km</strong></span>
        </div>
      </div>
    </div>
  );
}
