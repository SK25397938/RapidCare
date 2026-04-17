import { AnimatePresence, motion } from "framer-motion";
import ConfidenceBadge from "./ui/ConfidenceBadge";
import StatusBadge from "./ui/StatusBadge";
import WorkflowRail from "./ui/WorkflowRail";
import { formatDistance, formatEta } from "../utils/triage";

function StatRow({ label, value, accent = "text-white" }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-medium ${accent}`}>{value}</span>
    </div>
  );
}

const ambulanceStatusLabel = {
  assigned: "Assigned",
  en_route: "En route",
  arriving: "Arriving",
  idle: "Awaiting dispatch",
};

export default function RightPanel({
  activeHospital,
  ambulanceSnapshot,
  currentState,
  fallbackHospitals,
  holdTimeRemaining,
  noBedsAvailable,
  onConfirmReservation,
  panelOpen,
  reservation,
  shareLink,
  searchMessage,
  searchState,
  workflowSteps,
}) {
  return (
    <aside className="rounded-[30px] border border-white/10 bg-white/[0.065] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-rose-200/70">Emergency Action Center</p>
        <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-white">
          {searchState === "searching" ? "Routing incident" : noBedsAvailable ? "Fail-safe routing" : "Dispatch overview"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{searchMessage}</p>
      </div>

      <div className="mt-4">
        <WorkflowRail steps={workflowSteps} />
      </div>

      <div className="mt-4 rounded-[26px] border border-white/10 bg-slate-950/35 p-5">
        <AnimatePresence mode="wait">
          {panelOpen && activeHospital ? (
            <motion.div
              key={activeHospital.id + searchState}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Selected destination</p>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">{activeHospital.name}</h3>
                  <p className="mt-1 text-sm text-slate-300">{activeHospital.type} ICU</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {currentState ? <StatusBadge status={currentState} /> : null}
                  <ConfidenceBadge updatedAt={activeHospital.updatedAt} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Beds</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{activeHospital.beds}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">ETA</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{formatEta(activeHospital.etaMinutes)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Distance</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{formatDistance(activeHospital.distanceKm)}</div>
                </div>
              </div>

              {reservation?.status === "held" ? (
                <div className="rounded-[22px] border border-sky-400/25 bg-sky-500/10 px-4 py-4 text-sm text-sky-50">
                  Bed temporarily reserved for <span className="font-semibold">{holdTimeRemaining}s</span>. Confirm to convert the hold
                  into a reservation before timeout.
                </div>
              ) : null}

              <div className="space-y-3">
                <StatRow label="Routing state" value={searchState === "searching" ? "Searching hospitals" : "Best-fit hospital selected"} accent="text-cyan-200" />
                <StatRow label="Reservation" value={reservation?.status === "reserved" ? "Reserved" : reservation?.status === "held" ? "Temporary hold" : "Not reserved"} accent="text-sky-200" />
                <StatRow label="Ambulance status" value={ambulanceStatusLabel[ambulanceSnapshot.phase]} accent="text-emerald-200" />
                <StatRow label="ETA countdown" value={ambulanceSnapshot.active ? `${ambulanceSnapshot.etaMinutes} min` : "--"} accent="text-amber-200" />
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Ambulance tracking</div>
                    <div className="mt-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
                      {ambulanceStatusLabel[ambulanceSnapshot.phase]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Distance left</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      {ambulanceSnapshot.active ? `${ambulanceSnapshot.distanceKm} km` : "--"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(8, ambulanceSnapshot.progress * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onConfirmReservation}
                  disabled={!reservation || reservation.status === "reserved"}
                  className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    !reservation || reservation.status === "reserved"
                      ? "cursor-not-allowed border-white/10 bg-white/[0.04] text-slate-500"
                      : "border-fuchsia-300/30 bg-fuchsia-500/15 text-fuchsia-50 hover:bg-fuchsia-500/25"
                  }`}
                >
                  {reservation?.status === "reserved" ? "Reservation confirmed" : "Confirm reservation"}
                </button>
                <button
                  type="button"
                  onClick={() => window.navigator.clipboard?.writeText(shareLink)}
                  className="rounded-full border border-cyan-300/30 bg-cyan-500/15 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
                >
                  Share Emergency Status
                </button>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  Auto-dispatch remains locked to the current hospital until hold expires.
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Mock share link: <span className="text-cyan-200">{shareLink}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-[24px] border border-dashed border-white/15 px-4 py-12 text-center text-sm text-slate-400"
            >
              Trigger an emergency search or select a hospital to open the action lane.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {noBedsAvailable ? (
        <div className="mt-4 rounded-[24px] border border-amber-400/25 bg-amber-500/10 p-5">
          <p className="text-[10px] uppercase tracking-[0.34em] text-amber-200/80">Fail-safe</p>
          <h3 className="mt-3 font-['Space_Grotesk'] text-xl font-semibold text-white">Expanding search radius...</h3>
          <p className="mt-2 text-sm leading-6 text-amber-50/90">
            No open ICU beds are available in the primary radius. RapidCare is surfacing the nearest fallback hospitals.
          </p>

          <div className="mt-4 space-y-3">
            {fallbackHospitals.map((hospital) => (
              <div key={hospital.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                <div>
                  <div className="font-medium text-white">{hospital.name}</div>
                  <div className="text-sm text-slate-400">{hospital.type} ICU</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{formatEta(hospital.etaMinutes)}</div>
                  <div className="text-xs text-slate-400">{formatDistance(hospital.distanceKm)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
