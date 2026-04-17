export default function EmergencyButton({ onRequest }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[1200] flex justify-center px-4">
      <button
        type="button"
        onClick={onRequest}
        className="pointer-events-auto emergency-pulse inline-flex items-center justify-center gap-3 rounded-full border border-rose-300/30 bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 px-7 py-4 font-['Space_Grotesk'] text-lg font-semibold text-white shadow-[0_18px_45px_rgba(239,68,68,0.45)] transition duration-300 hover:scale-[1.02]"
      >
        <span className="text-xl">🚨</span>
        Request Emergency Help
      </button>
    </div>
  );
}
