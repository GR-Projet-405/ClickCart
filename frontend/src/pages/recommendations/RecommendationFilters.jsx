import React from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function RecommendationFilters({ activeFilter, onFilterChange, activeSort, onSortChange }) {
  const categories = ['All', 'AC Repair', 'Plumbing', 'Electrical', 'Appliance'];

  return (
    <div className="dev15-filter-bar">
      <div className="dev15-category-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`dev15-chip ${activeFilter === cat ? 'active' : ''}`}
            onClick={() => onFilterChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="dev15-filter-actions">
        <div className="dev15-select-wrapper">
          <ArrowUpDown size={14} className="dev15-select-icon" />
          <select 
            value={activeSort} 
            onChange={(e) => onSortChange(e.target.value)}
            className="dev15-sort-select"
          >
            <option value="match">Highest Match %</option>
            <option value="rating">Top Rated</option>
            <option value="distance">Nearest First</option>
            <option value="price-low">Price: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  );
}