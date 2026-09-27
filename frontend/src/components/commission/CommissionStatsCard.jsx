import Card from "../common/Card";

export default function CommissionStatsCard({ label, value, detail, tone = "green" }) {
  return <Card className={`commission-stat commission-stat--${tone}`}><span className="commission-stat__label">{label}</span><strong>{value}</strong><small>{detail}</small></Card>;
}
