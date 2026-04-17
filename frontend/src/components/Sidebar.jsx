import { getHospitalStatus } from "../utils/hospitalStatus";

function HospitalListItem({ hospital, selected, onClick }) {
  const status = getHospitalStatus(hospital.beds);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition duration-300 ${
        selected
          ? "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.16)]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.075]"
      }`}
    >
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-r-full"
        style={{ background: status.ring, boxShadow: `0 0 20px ${status.shadow}` }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">{hospital.name}</p>
          <p className="mt-1 text-sm text-slate-300">{hospital.type} ICU</p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-right">
          <div className="text-xl font-semibold text-white">{hospital.beds}</div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Beds</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.ring }} />
          {status.label}
        </span>
        <span className="text-sm text-slate-400 transition group-hover:text-slate-200">Tap to inspect</span>
      </div>
    </button>
  );
}

export default function Sidebar({ hospitals, selectedHospitalId, onSelectHospital, lastUpdated }) {
  return (
    <aside className="rounded-[30px] border border-white/10 bg-white/[0.065] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-cyan-200/70">Network Triage</p>
        <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold leading-tight text-white">
          Real-time ICU availability
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Triage hospitals by survivability, not guesswork. Live hospital markers sync automatically as the bed
          network changes.
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
          Updated {lastUpdated}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Hospitals</p>
          <p className="mt-1 text-sm text-slate-300">Sorted by immediate capacity</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
          {hospitals.length} Live
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {hospitals.map((hospital) => (
          <HospitalListItem
            key={hospital.id}
            hospital={hospital}
            selected={hospital.id === selectedHospitalId}
            onClick={() => onSelectHospital(hospital.id)}
          />
        ))}
      </div>
    </aside>
  );
}
