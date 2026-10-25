import "../search.css";

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="marketplace-sort-dropdown">
      <label htmlFor="marketplace-sort-by">Sort by</label>
      <select id="marketplace-sort-by" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="relevance">Relevance</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  );
}
