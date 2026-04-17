import AnimatedNumber from "./ui/AnimatedNumber";

export default function Topbar({ connectionState, dataHealth, hospitalsActive, surgeMode, onToggleSurgeMode, totals }) {
  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-4 pt-4 lg:px-5">
      <div className="flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-2xl">
        <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-br from-cyan-400 via-blue-500 to-rose-500 shadow-[0_0_35px_rgba(56,189,248,0.25)]">
          <span className="font-['Space_Grotesk'] text-xl font-bold text-white">RC</span>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-slate-400">Emergency Response System</p>
          <h1 className="mt-1 font-['Space_Grotesk'] text-3xl font-semibold text-white">RapidCare Command Grid</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[26px] border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(134,239,172,0.9)]" />
          {connectionState === "live" ? "Supabase live" : connectionState}
        </div>

        <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${dataHealth.pill}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${dataHealth.dot}`} />
          Data {dataHealth.label}
        </div>

        <button
          type="button"
          onClick={onToggleSurgeMode}
          className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition ${
            surgeMode
              ? "border-rose-300/30 bg-rose-500/20 text-rose-100 shadow-[0_0_22px_rgba(244,63,94,0.2)]"
              : "border-white/10 bg-white/5 text-slate-200"
          }`}
        >
          <span>Surge routing</span>
          <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${surgeMode ? "bg-rose-500/90" : "bg-slate-700"}`}>
            <span className={`h-4 w-4 rounded-full bg-white transition ${surgeMode ? "translate-x-6" : "translate-x-1"}`} />
          </span>
        </button>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          <AnimatedNumber value={totals.totalBeds} /> beds | <AnimatedNumber value={hospitalsActive} /> active | <AnimatedNumber value={totals.available} /> green | <AnimatedNumber value={totals.limited} /> orange | <AnimatedNumber value={totals.full} /> red
        </div>
      </div>
    </header>
  );
}
