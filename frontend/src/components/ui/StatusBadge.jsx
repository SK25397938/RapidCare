export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${status.pill}`}
      style={{ boxShadow: `0 0 22px ${status.shadow}` }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.ring }} />
      {status.label}
    </span>
  );
}
