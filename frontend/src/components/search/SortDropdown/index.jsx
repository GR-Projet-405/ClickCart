import "../search.css";

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="marketplace-sort-dropdown">
      <label htmlFor="marketplace-sort-by">Sort by</label>
      <select id="marketplace-sort-by" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="relevance">Relevance</option>
        <option value="price-low-to-high">Price: Low to High</option>
        <option value="price-high-to-low">Price: High to Low</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  );
}
