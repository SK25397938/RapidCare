import { motion } from "framer-motion";
import ConfidenceBadge from "./ui/ConfidenceBadge";
import StatusBadge from "./ui/StatusBadge";
import { getHospitalOperationalState } from "../utils/hospitalStatus";
import { formatDistance, formatEta } from "../utils/triage";

export default function HospitalCard({ hospital, reservation, rank, selected, onSelect, onReserve }) {
  const status = getHospitalOperationalState(hospital, reservation);
  const reserveDisabled = status.key === "full" || status.key === "reserved";

  return (
    <motion.article
      layout
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className={`group relative overflow-hidden rounded-[28px] border p-4 ${
        selected
          ? "border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
          : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.075]"
      }`}
    >
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-r-full"
        style={{ background: status.ring, boxShadow: `0 0 24px ${status.shadow}` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-950/70 text-sm font-semibold text-white">
            #{rank}
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white">{hospital.name}</h3>
            <p className="mt-1 text-sm text-slate-300">{hospital.type} ICU</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSelect}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.26em] text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
        >
          Inspect
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Beds</div>
          <div className="mt-2 text-xl font-semibold text-white">{hospital.beds}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">ETA</div>
          <div className="mt-2 text-xl font-semibold text-white">{formatEta(hospital.etaMinutes)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Distance</div>
          <div className="mt-2 text-xl font-semibold text-white">{formatDistance(hospital.distanceKm)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        <ConfidenceBadge updatedAt={hospital.updatedAt} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          Ranked using live bed state, ETA, and routing priority.
        </div>

        <button
          type="button"
          onClick={onReserve}
          disabled={reserveDisabled}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            reserveDisabled
              ? "cursor-not-allowed border-white/10 bg-white/[0.04] text-slate-500"
              : "border-sky-300/30 bg-sky-500/15 text-sky-50 hover:bg-sky-500/25"
          }`}
        >
          {status.key === "held" ? "Held" : status.key === "reserved" ? "Reserved" : "Reserve"}
        </button>
      </div>
    </motion.article>
  );
}
