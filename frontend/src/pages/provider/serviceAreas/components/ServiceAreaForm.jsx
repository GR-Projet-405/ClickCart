import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Save } from "lucide-react";
import Button from "../../../../components/common/Button";
import Card from "../../../../components/common/Card";
import ServiceAreaStatusToggle from "./ServiceAreaStatusToggle";
import LocationPreview from "./LocationPreview";
import { fetchDistricts, fetchLocationPresets } from "../../../../services/serviceAreaApi";
import "./ServiceAreaForm.css";

export default function ServiceAreaForm({
  title = "Add Service Area",
  subtitle = "Set up a new service area to expand your coverage and reach more customers.",
  initialData = {},
  onSubmit,
  submitting,
  isEdit = false,
}) {
  const navigate = useNavigate();

  const [districts, setDistricts] = useState([]);
  const [presets, setPresets] = useState({});

  const [formData, setFormData] = useState({
    district: initialData.district || "Western Province",
    cityName: initialData.cityName || "Colombo",
    postalCode: initialData.postalCode || "00100",
    radiusKm: initialData.radiusKm != null ? initialData.radiusKm : 10,
    active: initialData.active != null ? initialData.active : true,
    latitude: initialData.latitude || 6.9271,
    longitude: initialData.longitude || 79.8612,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    async function init() {
      const [distList, presetMap] = await Promise.all([
        fetchDistricts(),
        fetchLocationPresets(),
      ]);
      if (mounted) {
        if (distList && distList.length > 0) setDistricts(distList);
        if (presetMap) setPresets(presetMap);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialData && initialData.id) {
      setFormData({
        district: initialData.district || "Western Province",
        cityName: initialData.cityName || "",
        postalCode: initialData.postalCode || "",
        radiusKm: initialData.radiusKm != null ? initialData.radiusKm : 10,
        active: initialData.active != null ? initialData.active : true,
        latitude: initialData.latitude || 6.9271,
        longitude: initialData.longitude || 79.8612,
      });
    }
  }, [initialData]);

  // When city changes, look up preset coordinates and default postal code
  const handleCityChange = (e) => {
    const city = e.target.value;
    const lower = city.trim().toLowerCase();

    let newLat = formData.latitude;
    let newLon = formData.longitude;
    let newDistrict = formData.district;
    let newPostal = formData.postalCode;

    if (presets[lower]) {
      newLat = presets[lower].latitude;
      newLon = presets[lower].longitude;
      if (presets[lower].defaultDistrict) newDistrict = presets[lower].defaultDistrict;
      if (presets[lower].defaultPostalCode && !formData.postalCode) {
        newPostal = presets[lower].defaultPostalCode;
      }
    }

    setFormData((prev) => ({
      ...prev,
      cityName: city,
      district: newDistrict,
      postalCode: newPostal,
      latitude: newLat,
      longitude: newLon,
    }));

    if (errors.cityName) {
      setErrors((prev) => ({ ...prev, cityName: null }));
    }
  };

  const handleDistrictChange = (e) => {
    setFormData((prev) => ({ ...prev, district: e.target.value }));
    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: null }));
    }
  };

  const handleRadiusChange = (val) => {
    const num = Math.max(1, Math.min(200, Number(val) || 1));
    setFormData((prev) => ({ ...prev, radiusKm: num }));
    if (errors.radiusKm) {
      setErrors((prev) => ({ ...prev, radiusKm: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.district || !formData.district.trim()) {
      newErrors.district = "District is required";
    }
    if (!formData.cityName || !formData.cityName.trim()) {
      newErrors.cityName = "City Name is required";
    } else if (formData.cityName.trim().length < 2) {
      newErrors.cityName = "City Name must be at least 2 characters";
    }
    if (formData.radiusKm == null || isNaN(formData.radiusKm)) {
      newErrors.radiusKm = "Coverage radius is required";
    } else if (formData.radiusKm < 1 || formData.radiusKm > 200) {
      newErrors.radiusKm = "Coverage radius must be between 1 and 200 km";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      district: formData.district.trim(),
      cityName: formData.cityName.trim(),
      postalCode: formData.postalCode ? formData.postalCode.trim() : "",
      radiusKm: Number(formData.radiusKm),
      active: formData.active,
      status: formData.active ? "ACTIVE" : "INACTIVE",
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    onSubmit(payload, setErrors);
  };

  return (
    <div className="cc-service-area-form-page">
      {/* Back navigation matching Screenshot 2 */}
      <div className="cc-form-back-nav">
        <button
          type="button"
          className="cc-back-link-btn"
          onClick={() => navigate("/provider/service-areas")}
        >
          <ArrowLeft size={16} />
          <span>Service Areas</span>
        </button>
      </div>

      {/* Page Title & Subtitle */}
      <div className="cc-form-page-header">
        <h1 className="cc-form-page-title">{title}</h1>
        <p className="cc-form-page-subtitle">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Two-Column Grid: Area Details on Left, Location Preview on Right */}
        <div className="cc-form-grid">
          {/* Left Column: Area Details Card */}
          <Card className="cc-form-details-card" padding="lg">
            <div className="cc-form-card-header">
              <div className="cc-form-card-icon-badge">
                <MapPin size={20} />
              </div>
              <h2 className="cc-form-card-title">Area Details</h2>
            </div>

            <div className="cc-form-fields-stack">
              {/* District Field */}
              <div className="cc-form-field-group">
                <label htmlFor="sa-district" className="cc-form-label">
                  District <span className="cc-form-required">*</span>
                </label>
                <div className="cc-select-wrapper">
                  <select
                    id="sa-district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    className={`cc-form-select ${errors.district ? "cc-input--error" : ""}`}
                    aria-invalid={Boolean(errors.district)}
                    aria-describedby={errors.district ? "district-error" : undefined}
                    required
                  >
                    {districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.district && (
                  <p id="district-error" className="cc-form-error-msg" role="alert">
                    {errors.district}
                  </p>
                )}
              </div>

              {/* City Name Field */}
              <div className="cc-form-field-group">
                <label htmlFor="sa-city" className="cc-form-label">
                  City Name <span className="cc-form-required">*</span>
                </label>
                <input
                  id="sa-city"
                  type="text"
                  placeholder="e.g. Colombo, Kandy, Galle"
                  value={formData.cityName}
                  onChange={handleCityChange}
                  className={`cc-form-input ${errors.cityName ? "cc-input--error" : ""}`}
                  aria-invalid={Boolean(errors.cityName)}
                  aria-describedby={errors.cityName ? "city-error" : undefined}
                  required
                />
                {errors.cityName && (
                  <p id="city-error" className="cc-form-error-msg" role="alert">
                    {errors.cityName}
                  </p>
                )}
              </div>

              {/* Coverage Radius Field with Km suffix & Interactive Slider */}
              <div className="cc-form-field-group">
                <label htmlFor="sa-radius" className="cc-form-label">
                  Coverage Radius (km) <span className="cc-form-required">*</span>
                </label>
                <div className="cc-radius-input-wrap">
                  <input
                    id="sa-radius"
                    type="number"
                    min="1"
                    max="200"
                    value={formData.radiusKm}
                    onChange={(e) => handleRadiusChange(e.target.value)}
                    className={`cc-form-input cc-radius-input ${errors.radiusKm ? "cc-input--error" : ""}`}
                    aria-invalid={Boolean(errors.radiusKm)}
                    aria-describedby={errors.radiusKm ? "radius-error" : undefined}
                    required
                  />
                  <span className="cc-radius-unit">km</span>
                </div>

                {/* Range Slider matching Screenshot 2 */}
                <div className="cc-radius-slider-wrap">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={Math.min(50, formData.radiusKm)}
                    onChange={(e) => handleRadiusChange(e.target.value)}
                    className="cc-radius-slider"
                    style={{
                      background: `linear-gradient(to right, #10b926 0%, #10b926 ${
                        ((Math.min(50, formData.radiusKm) - 1) / 49) * 100
                      }%, #e2e8f0 ${
                        ((Math.min(50, formData.radiusKm) - 1) / 49) * 100
                      }%, #e2e8f0 100%)`,
                    }}
                    aria-label="Coverage radius slider"
                  />
                  <div className="cc-slider-labels">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {errors.radiusKm && (
                  <p id="radius-error" className="cc-form-error-msg" role="alert">
                    {errors.radiusKm}
                  </p>
                )}
              </div>

              {/* Status Toggle matching Screenshot 2 */}
              <div className="cc-form-field-group">
                <label className="cc-form-label">Status</label>
                <div className="cc-form-status-row">
                  <ServiceAreaStatusToggle
                    active={formData.active}
                    onChange={(newVal) =>
                      setFormData((prev) => ({ ...prev, active: newVal }))
                    }
                  />
                </div>
                <p className="cc-form-helper-note">
                  This area will be available for service providers.
                </p>
              </div>
            </div>
          </Card>

          {/* Right Column: Location Preview Card */}
          <div className="cc-form-preview-column">
            <LocationPreview
              cityName={formData.cityName}
              district={formData.district}
              postalCode={formData.postalCode}
              radiusKm={formData.radiusKm}
              latitude={formData.latitude}
              longitude={formData.longitude}
            />
          </div>
        </div>

        {/* Bottom Actions Bar matching Screenshot 2 */}
        <div className="cc-form-actions-bar">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/provider/service-areas")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save size={18} />}
            loading={submitting}
          >
            {isEdit ? "Update Area" : "Save Area"}
          </Button>
        </div>
      </form>
    </div>
  );
}
