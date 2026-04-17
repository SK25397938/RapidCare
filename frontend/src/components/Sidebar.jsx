import { AnimatePresence, motion } from "framer-motion";
import HospitalCard from "./HospitalCard";

export default function Sidebar({
  hospitals,
  reservation,
  searchState,
  searchMessage,
  selectedHospitalId,
  onReserveHospital,
  onSelectHospital,
  lastUpdated,
}) {
  return (
    <aside className="rounded-[30px] border border-white/10 bg-white/[0.065] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-cyan-200/70">Hospital Ranking</p>
        <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold leading-tight text-white">
          Search, select, reserve, and track
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Every card shows operational status, confidence, and route timing so triage teams can commit quickly.
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
          <span className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
            Feed updated {lastUpdated}
          </span>
          <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/70">
            {hospitals.length} hospitals
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={searchState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3"
        >
          <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500">System state</div>
          <div className="mt-2 flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${searchState === "searching" ? "bg-cyan-300 animate-pulse" : "bg-emerald-300"}`} />
            <p className="text-sm text-slate-200">{searchMessage}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 space-y-3">
        {hospitals.map((hospital, index) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            rank={index + 1}
            reservation={reservation}
            selected={hospital.id === selectedHospitalId}
            onReserve={() => onReserveHospital(hospital.id)}
            onSelect={() => onSelectHospital(hospital.id)}
          />
        ))}
      </div>
    </aside>
  );
}
