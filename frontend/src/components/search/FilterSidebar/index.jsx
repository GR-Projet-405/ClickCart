import { SlidersHorizontal } from "lucide-react";
import Select from "../../common/Select";
import PriceRangeSlider from "../PriceRangeSlider";
import "../search.css";

export default function FilterSidebar({
  category,
  onCategoryChange,
  location,
  onLocationChange,
  locations,
  categories,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  ratingOptions,
  availabilityOptions,
  onClearAll,
}) {
  return (
    <aside className="marketplace-filter-sidebar" aria-label="Advanced filters">
      <div className="marketplace-filter-sidebar__header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <SlidersHorizontal size={18} color="var(--cc-primary-dark)" />
          <h3>Advanced Filters</h3>
        </div>
        <button type="button" className="marketplace-filter-sidebar__clear" onClick={onClearAll}>
          Clear All
        </button>
      </div>

      <div className="marketplace-filter-group">
        <h4 className="marketplace-filter-group__title">Service Category</h4>
        <Select label="" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="All categories">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </div>

      <div className="marketplace-filter-group">
        <h4 className="marketplace-filter-group__title">Location</h4>
        <Select label="" value={location} onChange={(event) => onLocationChange(event.target.value)}>
          <option value="All locations">All locations</option>
          {locations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </div>

      <div className="marketplace-filter-group">
        <h4 className="marketplace-filter-group__title">Price Range</h4>
        <PriceRangeSlider
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={onMinPriceChange}
          onMaxPriceChange={onMaxPriceChange}
        />
      </div>

      <div className="marketplace-filter-group">
        <h4 className="marketplace-filter-group__title">Rating</h4>
        <div className="marketplace-filter-checklist">
          {ratingOptions.map(({ label, value, count }) => (
            <div className="marketplace-filter-option" key={label}>
              <label>
                <input type="checkbox" checked={value.checked} onChange={() => value.onChange()} />
                <span>{label}</span>
              </label>
              <span className="marketplace-filter-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="marketplace-filter-group">
        <h4 className="marketplace-filter-group__title">Availability</h4>
        <div className="marketplace-filter-checklist">
          {availabilityOptions.map(({ label, value, count }) => (
            <div className="marketplace-filter-option" key={label}>
              <label>
                <input type="checkbox" checked={value.checked} onChange={() => value.onChange()} />
                <span>{label}</span>
              </label>
              <span className="marketplace-filter-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
