import "../search.css";

export default function PriceRangeSlider({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) {
  const minValue = Math.min(minPrice, maxPrice);
  const maxValue = Math.max(minPrice, maxPrice);

  return (
    <div className="marketplace-price-range">
      <div className="marketplace-price-range__values">
        <span>LKR {minValue.toLocaleString("en-LK")}</span>
        <span>LKR {maxValue.toLocaleString("en-LK")}</span>
      </div>
      <div className="marketplace-price-range__sliders">
        <div className="marketplace-price-range__track" />
        <input
          type="range"
          min={500}
          max={15000}
          step={100}
          value={minValue}
          onChange={(event) => onMinPriceChange(Math.min(Number(event.target.value), maxValue - 100))}
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={500}
          max={15000}
          step={100}
          value={maxValue}
          onChange={(event) => onMaxPriceChange(Math.max(Number(event.target.value), minValue + 100))}
          aria-label="Maximum price"
        />
      </div>
    </div>
  );
}
