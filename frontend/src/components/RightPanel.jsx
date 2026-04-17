import { getHospitalStatus } from "../utils/hospitalStatus";

function StatRow({ label, value, accent = "text-white" }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-medium ${accent}`}>{value}</span>
    </div>
  );
}

export default function RightPanel({ assignedHospital, selectedHospital, hasRequestedHelp }) {
  const previewHospital = assignedHospital || selectedHospital;
  const status = previewHospital ? getHospitalStatus(previewHospital.beds) : null;

  return (
    <aside className="rounded-[30px] border border-white/10 bg-white/[0.065] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-rose-200/70">Emergency Assignment</p>
        <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-white">
          {hasRequestedHelp ? "Dispatch active" : "Stand by"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {hasRequestedHelp
            ? "RapidCare has locked the highest-value destination and initiated ambulance coordination."
            : "Press the emergency button to assign the nearest best-fit ICU and surface response details."}
        </p>
      </div>

      <div className="mt-4 rounded-[26px] border border-white/10 bg-slate-950/35 p-5">
        {previewHospital ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  {hasRequestedHelp ? "Assigned Hospital" : "Selected Hospital"}
                </p>
                <h3 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">{previewHospital.name}</h3>
                <p className="mt-1 text-sm text-slate-300">{previewHospital.type} ICU</p>
              </div>

              <div
                className="rounded-full px-4 py-2 text-sm font-medium"
                style={{
                  background: `${status.ring}22`,
                  color: status.ring,
                  boxShadow: `0 0 24px ${status.shadow}`,
                }}
              >
                {status.label}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <StatRow label="Available ICU Beds" value={`${previewHospital.beds}`} accent="text-white" />
              <StatRow label="ICU Type" value={previewHospital.type} accent="text-cyan-200" />
              <StatRow label="Ambulance Status" value={hasRequestedHelp ? "En route to pickup" : "Awaiting dispatch"} accent="text-emerald-200" />
              <StatRow label="ETA" value={hasRequestedHelp ? "08 mins" : "--"} accent="text-amber-200" />
            </div>

            <div className="mt-5 rounded-[24px] border border-cyan-400/15 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50">
              Predictive allocation recommends this site based on current bed count, specialty match, and immediate response
              readiness.
            </div>
          </>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/15 px-4 py-12 text-center text-sm text-slate-400">
            Waiting for hospital telemetry...
          </div>
        )}
      </div>
    </aside>
  );
}
