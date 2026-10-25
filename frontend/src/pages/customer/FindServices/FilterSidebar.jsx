import React from 'react';
import { X, Check, Star } from 'lucide-react';
import './FilterSidebar.css';

const CATEGORIES = ['Cleaning', 'Plumbing', 'AC Repair', 'Electrical', 'Beauty & Salon', 'Pest Control', 'Carpentry', 'Painting'];

export default function FilterSidebar({
  isOpen,
  onClose,
  activeFilter,
  setActiveFilter,
  searchRadius,
  setSearchRadius,
  minRating,
  setMinRating
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="find-services__filter-overlay-bg" onClick={onClose} />
      
      <div className="find-services__filter-sidebar">
        <div className="filter-sidebar__header">
          <h2>Filters</h2>
          <button className="filter-sidebar__close" onClick={onClose}>
            <X size={18} color="#9CA3AF" />
          </button>
        </div>

        <div className="filter-sidebar__content">
          {/* Categories Section */}
          <div className="filter-section">
            <h3 className="filter-section__title">Categories</h3>
            <div className="filter-category__grid">
              <button 
                className={`filter-category__btn ${activeFilter === 'All' ? 'filter-category__btn--active' : ''}`}
                onClick={() => setActiveFilter('All')}
              >
                <span className="filter-category__text">All Services</span>
                {activeFilter === 'All' && (
                  <div className="filter-category__check">
                    <Check size={10} color="#FFFFFF" strokeWidth={3} />
                  </div>
                )}
              </button>
              
              {CATEGORIES.map(category => (
                <button 
                  key={category}
                  className={`filter-category__btn ${activeFilter === category ? 'filter-category__btn--active' : ''}`}
                  onClick={() => setActiveFilter(category)}
                >
                  <span className="filter-category__text">{category}</span>
                  {activeFilter === category && (
                    <div className="filter-category__check">
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Section */}
          <div className="filter-section">
            <div className="filter-section__header-row">
              <h3 className="filter-section__title">Distance Radius</h3>
              <span className="filter-section__value">{searchRadius} km</span>
            </div>
            <div className="filter-slider">
              <div className="filter-slider__track">
                <div 
                  className="filter-slider__fill" 
                  style={{ width: `${(searchRadius / 50) * 100}%` }} 
                />
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  opacity: 0, 
                  cursor: 'pointer',
                  zIndex: 10 
                }}
              />
              <div 
                className="filter-slider__thumb" 
                style={{ left: `${(searchRadius / 50) * 100}%` }} 
              />
            </div>
            <div className="filter-slider__labels">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Ratings Section */}
          <div className="filter-section">
            <h3 className="filter-section__title">Minimum Rating</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[4, 3, 0].map(rating => (
                <button 
                  key={rating}
                  className={`filter-rating__btn ${minRating === rating ? 'filter-rating__btn--active' : ''}`}
                  onClick={() => setMinRating(rating)}
                >
                  <div className="filter-rating__stars">
                    {rating > 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < rating ? '#F59E0B' : '#E5E7EB'} 
                          color={i < rating ? '#F59E0B' : '#E5E7EB'} 
                        />
                      ))
                    ) : (
                      <span className="filter-category__text">Any Rating</span>
                    )}
                  </div>
                  {rating > 0 && <span className="filter-rating__text">{rating}.0 & up</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-sidebar__footer">
          <button 
            className="filter-footer__clear"
            onClick={() => {
              setActiveFilter('All');
              setSearchRadius(2);
              setMinRating(0);
            }}
          >
            Clear all
          </button>
          <button className="filter-footer__show" onClick={onClose}>
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}
