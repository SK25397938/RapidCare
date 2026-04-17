export default function WorkflowRail({ steps }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`rounded-2xl border px-3 py-3 text-center transition ${
            step.active
              ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.14)]"
              : step.completed
                ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-50"
                : "border-white/10 bg-white/[0.03] text-slate-400"
          }`}
        >
          <div className="text-[10px] uppercase tracking-[0.34em]">Step</div>
          <div className="mt-2 font-['Space_Grotesk'] text-sm font-semibold">{step.label}</div>
        </div>
      ))}
    </div>
  );
}
