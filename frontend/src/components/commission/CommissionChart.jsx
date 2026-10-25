import { useId, useState } from "react";

const money = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
const dateLabel = (date) => date ? new Date(date.length === 10 ? `${date}T00:00:00+05:30` : date).toLocaleString("en-GB", { timeZone: "Asia/Colombo", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Date unavailable";

export default function CommissionChart({ data = [], values }) {
  const gradientId = useId();
  const [activeIndex, setActiveIndex] = useState(null);
  const series = values ? values.map((value) => ({ value })) : data;
  if (!series.length) return <p className="commission-empty">No commission revenue data available.</p>;
  const amounts = series.map((point) => Number(point.value) || 0);
  const maximum = Math.max(1, ...amounts) * 1.15;
  const minimum = Math.min(0, ...amounts);
  const plotWidth = Math.max(300, series.length * 48);
  const x = (index) => series.length === 1 ? plotWidth / 2 : 24 + index * (plotWidth - 48) / (series.length - 1);
  const y = (value) => 150 - (value - minimum) / (maximum - minimum) * 140;
  const line = amounts.map((amount, index) => `${index ? "L" : "M"} ${x(index)} ${y(amount)}`).join(" ");
  const area = `${line} L ${x(series.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const selected = activeIndex !== null && series[activeIndex] ? activeIndex : series.length - 1;
  return <div className="commission-revenue-chart">
    <div className="commission-revenue-chart__quote" aria-live="polite"><strong>{money(amounts[selected])} <small>LKR</small></strong><span>Transaction {String(selected + 1).padStart(2, "0")} · {series[selected].id || `Transaction ${selected + 1}`} · {dateLabel(series[selected].date)}</span></div>
    <div className="commission-revenue-chart__scale" style={{ height: 210 }}><span>{money(maximum)}</span><span>{money((maximum + minimum) / 2)}</span><span>{money(minimum)}</span></div>
    <div className="commission-revenue-chart__plot">
      <div className="commission-revenue-chart__scroll">
      <div style={{ minWidth: plotWidth }}>
      <svg viewBox={`0 0 ${plotWidth} 160`} style={{ minWidth: plotWidth, height: 210 }} preserveAspectRatio="none" role="img" aria-label="Line and shaded area chart of paid commission amounts per transaction in LKR">
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#159765" stopOpacity="0.3" /><stop offset="100%" stopColor="#159765" stopOpacity="0.02" /></linearGradient></defs>
        {[10, 80, 150].map((position) => <line key={position} x1="5" x2={plotWidth - 5} y1={position} y2={position} stroke="var(--cc-border)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />)}
        {series.length > 1 && <><path d={area} fill={`url(#${gradientId})`} /><path d={line} fill="none" stroke="#159765" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></>}
        <line x1={x(selected)} x2={x(selected)} y1="10" y2="150" stroke="#159765" strokeOpacity="0.35" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        {series.map((point, index) => {
          const amount = amounts[index];
          const label = `#${index + 1} · ${point.id || `Transaction ${index + 1}`} · ${dateLabel(point.date)}: ${money(amount)} LKR`;
          return <g key={point.id || index} tabIndex={0} role="img" aria-label={label} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onFocus={() => setActiveIndex(index)} onBlur={() => setActiveIndex(null)}>
            <title>{label}</title>
            <rect x={x(index) - 10} y="0" width="20" height="180" fill="transparent" />
            <circle cx={x(index)} cy={y(amount)} r={index === selected ? 3.5 : 2} fill="#159765" stroke="white" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>;
        })}
      </svg>
      <div className="commission-revenue-chart__axis" aria-label="Transactions">
        {series.map((point, index) => <button
          key={point.id || index}
          type="button"
          className={`commission-revenue-chart__tick${index === selected ? " is-active" : ""}`}
          style={{ left: `${x(index) / plotWidth * 100}%` }}
          aria-label={`Transaction ${index + 1}: ${money(amounts[index])} LKR`}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
          onFocus={() => setActiveIndex(index)}
          onBlur={() => setActiveIndex(null)}
          onClick={() => setActiveIndex(index)}
        >{String(index + 1).padStart(2, "0")}</button>)}
      </div>
      <div className="commission-revenue-chart__axis-caption"><span>TRANSACTIONS</span><span>Oldest → Newest</span></div>
      </div>
      </div>
    </div>
    <p className="commission-revenue-chart__caption">{series.length === 1 ? "One paid commission transaction is available. The trend line appears when more transactions are recorded." : "Each point is a paid commission transaction · Oldest to newest · Hover or focus a point for details."}</p>
    {amounts.every((value) => value === 0) && <p>No commission revenue recorded in this period.</p>}
    <details><summary>View commission transactions</summary><div className="commission-table-wrap"><table className="commission-table"><thead><tr><th>#</th><th>Transaction</th><th>Date</th><th>Commission (LKR)</th></tr></thead><tbody>{series.map((point, index) => <tr key={point.id || index}><td>{index + 1}</td><td>{point.id || index + 1}</td><td>{dateLabel(point.date)}</td><td>{money(amounts[index])}</td></tr>)}</tbody></table></div></details>
  </div>;
}
