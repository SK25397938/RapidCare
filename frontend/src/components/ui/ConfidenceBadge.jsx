import { formatFreshness, getConfidenceState } from "../../utils/hospitalStatus";

export default function ConfidenceBadge({ updatedAt }) {
  const confidence = getConfidenceState(updatedAt);

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${confidence.pill}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${confidence.dot}`} />
      <span className="font-medium">{confidence.label}</span>
      <span className="text-white/60">{formatFreshness(updatedAt)}</span>
    </div>
  );
}
